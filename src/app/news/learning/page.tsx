import { redirect } from "next/navigation";

export default function LearningNewsPage() {
  redirect("/news?category=learning");
}
