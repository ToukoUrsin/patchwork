import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Patchwork — Every visitor belongs in the story",
  description:
    "An editorial workbench for accessible, multilingual museum stories, with real Sanity revisions and source-linked review.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
