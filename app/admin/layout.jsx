import { C } from "@/lib/constants";

export default function AdminLayout({ children }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: C.deep, color: C.ink, maxWidth: 720, margin: "0 auto" }}
    >
      {children}
    </div>
  );
}
