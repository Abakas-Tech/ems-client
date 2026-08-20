import React from "react";

import CVThreeComponent from "./../../../../components/workers/modules/CV/CVThree";

/**
 * Single shared CV layout. All partners use this same layout —
 * only the header image differs per partner, which is rendered
 * inside CVThreeComponent itself (via the partner's cv_header_url).
 * The old three-way template switcher is gone along with
 * cv_template_code / CVOne / CVTwo.
 */
export default function CV() {
  return <CVThreeComponent />;
}
