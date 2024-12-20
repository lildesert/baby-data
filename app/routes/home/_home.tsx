import { useEffect, useState } from "react";
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

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const startDateTime = formData.get("startDateTime");
  invariant(isString(startDateTime), "Missing startDateTime");
  const parsedStartDateTime = new Date(startDateTime);
  try {
    await sendDataToSpreadsheet({ startDateTime: parsedStartDateTime });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return data({ errorCode: "unknown" }, { status: 500 });
  }
}

export default function Home({ actionData }: Route.ComponentProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
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
              <Label htmlFor="dateTime">Date de début</Label>
              <Input
                type="datetime-local"
                id="dateTime"
                name="startDateTime"
                defaultValue={`${currentDate}T${new Date()
                  .toTimeString()
                  .slice(0, 5)}`}
                required
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