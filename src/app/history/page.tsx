import { redirect } from "next/navigation";

export default function HistoryRoute() {
  redirect("/?tab=history");
}
