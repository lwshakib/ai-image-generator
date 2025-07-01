import { ModalProvider } from "@/components/modal-provider";
import { checkUser } from "@/lib/checkuser";
import { MainNavbar } from "./_components/main-navbar";

export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkUser();
  return (
    <div className="w-full relative">
      <ModalProvider />
      <MainNavbar />
      {children}
    </div>
  );
}
