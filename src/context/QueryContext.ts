import { createContext } from "react";
import { ContextType } from "../types/context";

const QueryContext = createContext<ContextType | null>(null);

export default QueryContext;