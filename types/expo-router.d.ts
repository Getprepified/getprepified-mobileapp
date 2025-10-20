import { LinkProps as OriginalLinkProps } from "expo-router";

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "parent/students/[studentId]": { studentId: string };
      "parent/students/[studentId]/tests": { studentId: string };
      "parent/test/[testId]": { testId: string };
      // Add other dynamic routes here as needed
    }
  }
}

declare module "expo-router" {
  export interface LinkProps extends OriginalLinkProps {
    href: string | { pathname: string; params?: Record<string, any> };
  }
}
