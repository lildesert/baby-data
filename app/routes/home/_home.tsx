import { format } from "date-fns";
import { useEffect } from "react";
import { data, Form, useNavigation } from "react-router";
import invariant from "tiny-invariant";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { toast } from "../../hooks/use-toast";
import { sendDataToSpreadsheet } from "../../services/googleSheetsService";
import type { Route } from "./+types/_home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Baby data" }];
}

const isString = (value: unknown): value is string => typeof value === "string";

const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return format(date, "dd/MM/yyyy HH:mm:ss");
};

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const startDateTime = formData.get("startDateTime");
  invariant(isString(startDateTime), "Missing startDateTime");
  const formattedStartDate = formatDateTime(startDateTime);

  const endDateTime = formData.get("endDateTime");
  const formattedEndDate =
    isString(endDateTime) && endDateTime !== ""
      ? formatDateTime(endDateTime)
      : "";
  try {
    await sendDataToSpreadsheet({
      startDateTime: formattedStartDate,
      endDateTime: formattedEndDate,
    });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return data({ errorCode: "unknown" }, { status: 500 });
  }
}

export default function Home({ actionData }: Route.ComponentProps) {
  const { state } = useNavigation();
  const isSubmitting = state !== "idle";
  const isSubmitSuccess = !!actionData && "ok" in actionData;

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
            <Button type="submit" disabled={isSubmitting}>
              Valider
            </Button>
          </Form>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Ajouter un poids</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                name="date"
                defaultValue={currentDate}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Poids</Label>
              <Input type="number" id="number" name="number" required />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Valider
            </Button>
          </Form>
        </CardContent>
      </Card> */}
    </main>
  );
}
