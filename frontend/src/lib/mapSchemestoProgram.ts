import type { Program } from "@/components/ProgramList";
import type { Scheme } from "@/contexts/EligibilityContext";

export function mapSchemesToPrograms(schemes: Scheme[]): Program[] {
  return schemes.map((s): Program => ({
    id: String(s.id),

    title: String(s.name ?? "Support scheme"),

    description: String(
      s.description ??
        "This support may help with costs related to your situation."
    ),

    category: String(s.source ?? "Municipal support"),

    confidence: "medium",

    applicationTime:
      typeof s.time_to_apply_min === "number"
        ? s.time_to_apply_min
        : 30,

    processingTime: 4,
  }));
}
