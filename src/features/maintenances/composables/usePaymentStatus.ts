export type PaymentStatusName = "Unpaid" | "PartiallyPaid" | "Paid";

const statusMeta: Record<
  PaymentStatusName,
  { color: string; label: string; icon: string }
> = {
  Unpaid: {
    color: "error",
    label: "غير مدفوع",
    icon: "mdi-close-circle-outline",
  },

  PartiallyPaid: {
    color: "warning",
    label: "مدفوع جزئياً",
    icon: "mdi-progress-clock",
  },

  Paid: {
    color: "success",
    label: "مدفوع بالكامل",
    icon: "mdi-check-circle-outline",
  },
};

export function usePaymentStatus() {
  function getStatusMeta(name: string) {
    return (
      statusMeta[name as PaymentStatusName] || {
        color: "grey",
        label: name,
        icon: "mdi-help-circle",
      }
    );
  }

  return { getStatusMeta, statusMeta };
}
