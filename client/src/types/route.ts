import * as React from "react";
import type {JSX} from "react";

export interface IRoute {
  path: string;
  element: React.LazyExoticComponent<() => JSX.Element>;
  layout: string;
  isPublic?: boolean;
}