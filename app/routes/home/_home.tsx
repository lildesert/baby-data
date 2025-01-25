import { format } from "date-fns";
import { Suspense, useEffect } from "react";
import { Await, data, Form, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { toast } from "../../hooks/use-toast";
import {
  getLastFoodTime,
  sendFoodDataToSpreadsheet,
  sendWCDataToSpreadsheet,
} from "../../services/googleSheetsService";
import type { Route } from "./+types/_home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Baby data" }];
}

const isString = (value: unknown): value is string => typeof value === "string";

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return format(date, "dd/MM/yyyy HH:mm:ss");
};

enum Action {
  FOOD = "FOOD",
  WC = "WC",
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const action = formData.get("_action");
  invariant(isString(action), "Missing _action");

  if (action === Action.FOOD) {
    return handleFoodData(formData);
  }
  if (action === Action.WC) {
    return handleWCData(formData);
  }

  return data({ errorCode: "invalid-action" }, { status: 400 });
}

export async function loader() {
  const lastFoodTime = getLastFoodTime();
  return { lastFoodTime };
}

const handleFoodData = async (formData: FormData) => {
  const startDateTime = formData.get("startDateTime");
  invariant(isString(startDateTime), "Missing startDateTime");
  const formattedStartDate = formatDateTime(startDateTime);

  const endDateTime = formData.get("endDateTime");
  const formattedEndDate =
    isString(endDateTime) && endDateTime !== ""
      ? formatDateTime(endDateTime)
      : "";
  try {
    await sendFoodDataToSpreadsheet({
      startDateTime: formattedStartDate,
      endDateTime: formattedEndDate,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return data({ errorCode: "unknown" }, { status: 500 });
  }
};

const handleWCData = async (formData: FormData) => {
  const hasPeed = formData.get("hasPeed");
  invariant(isString(hasPeed), "Missing hasPeed");
  const hasPeedValue = hasPeed === "true";

  const hasPooped = formData.get("hasPooped");
  invariant(isString(hasPooped), "Missing hasPooped");
  const hasPoopedValue = hasPooped === "true";

  const startDateTime = formData.get("startDateTime");
  invariant(isString(startDateTime), "Missing startDateTime");
  const formattedStartDate = formatDateTime(startDateTime);

  try {
    await sendWCDataToSpreadsheet({
      startDateTime: formattedStartDate,
      hasPeed: hasPeedValue,
      hasPooped: hasPoopedValue,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return data({ errorCode: "unknown" }, { status: 500 });
  }
};

export default function Home({ actionData, loaderData }: Route.ComponentProps) {
  const { lastFoodTime } = loaderData;
  const { state } = useNavigation();
  const isSubmitting = state !== "idle";
  const isSubmitSuccess =
    state === "idle" && !!actionData && "ok" in actionData;

  useEffect(() => {
    if (isSubmitSuccess) {
      toast({
        title: "Success",
        description: "Data submitted successfully!",
        duration: 3000,
      });
    }
  }, [isSubmitSuccess]);

  return (
    <main className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dernière tétée</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={"Loading..."}>
            <Await resolve={lastFoodTime}>
              {(lastFoodTime) =>
                lastFoodTime ? lastFoodTime : "Aucune donnée"
              }
            </Await>
          </Suspense>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une tétée</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDateTime">Date de début *</Label>
              <Input
                type="datetime-local"
                id="startDateTime"
                name="startDateTime"
                defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDateTime">Date de fin</Label>
              <Input
                type="datetime-local"
                id="endDateTime"
                name="endDateTime"
              />
            </div>
            <Button
              type="submit"
              name="_action"
              value={Action.FOOD}
              disabled={isSubmitting}
            >
              Valider
            </Button>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WC</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="startDateTime">Date *</Label>
              <Input
                type="datetime-local"
                id="startDateTime"
                name="startDateTime"
                defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasPeed">Pipi</Label>
              <RadioGroup defaultValue="true" name="hasPeed" id="hasPeed">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="option-yes" />
                  <Label htmlFor="option-yes">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="option-no" />
                  <Label htmlFor="option-no">Non</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hasPooped">Caca</Label>
              <RadioGroup defaultValue="true" name="hasPooped" id="hasPooped">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="option-yes" />
                  <Label htmlFor="option-yes">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="option-no" />
                  <Label htmlFor="option-no">Non</Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              type="submit"
              name="_action"
              value={Action.WC}
              disabled={isSubmitting}
            >
              Valider
            </Button>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
