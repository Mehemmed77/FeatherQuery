import { createContext } from "react";
import { ContextType } from "../types/ContextType";

const QueryContext = createContext<ContextType | null>(null);

export default QueryContext;