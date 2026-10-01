import React from "react";
import { useParams } from "react-router-dom";
import InvoicePrintPreviewComponent from "../../components/invoices/InvoicePrintPreview/InvoicePrintPreview";

function InvoicePrintPreview() {
  const { id } = useParams();

  return (
    <>
      <InvoicePrintPreviewComponent invoiceId={id} />
    </>
  );
}

export default InvoicePrintPreview;
