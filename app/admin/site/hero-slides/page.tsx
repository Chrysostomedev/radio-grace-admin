import { redirect } from "next/navigation";

export default function HeroSlidesPage() {
  // Redirect to the site version by default
  redirect("/admin/site/hero-slides/site");
}
