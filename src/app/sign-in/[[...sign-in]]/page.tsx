import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="page-center">
      <SignIn />
    </div>
  );
}
