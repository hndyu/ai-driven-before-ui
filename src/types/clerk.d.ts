declare module "@clerk/nextjs" {
  import * as React from "react";

  // Common props used by Clerk components in this project: allow passing any props
  // but avoid `any` by using a loose unknown-record shape.
  export type ClerkComponentProps = Record<string, unknown>;

  export const SignIn: React.ComponentType<ClerkComponentProps>;
  export const SignUp: React.ComponentType<ClerkComponentProps>;
  export const SignInButton: React.ComponentType<ClerkComponentProps>;
  export const SignUpButton: React.ComponentType<ClerkComponentProps>;
  export const UserButton: React.ComponentType<ClerkComponentProps>;

  // Provide a typed default export so importing default doesn't become `any`.
  const _default: {
    SignIn: React.ComponentType<ClerkComponentProps>;
    SignUp: React.ComponentType<ClerkComponentProps>;
    SignInButton: React.ComponentType<ClerkComponentProps>;
    SignUpButton: React.ComponentType<ClerkComponentProps>;
    UserButton: React.ComponentType<ClerkComponentProps>;
  };

  export default _default;
}
