"use client";

import { FormEvent, useMemo, useState } from "react";

type Section =
  | "Dashboard"
  | "Kora Purchase"
  | "Raw Stock / Lots"
  | "Dyeing & Printing"
  | "Cutting"
  | "Embroidery"
  | "Finished Stock"
  | "Sales"
  | "Customer Khata"
  | "Supplier / Vendor Khata"
  | "Reports";

type Supplier = {
  id: string;
  name: string;
  notes?: string;
};

type Vendor = {
  id: string;
  name: string;
  service: "Dyeing" | "Embroidery" | "Both";
  notes?: string;
};

type Customer = {
  id: string;
  name: string;
  notes?: string;
};

type RawLot = {
  id: string;
  lotNumber: string;
  supplierId: string;
  clothType: string;
  purchasedMeters: number;
  rawAvailableMeters: number;
  processedMeters: number;
  ratePerMeter: number;
  paidAmount: number;
  notes: string;
  createdAt: string;
};

type ProcessingJob = {
  id: string;
  jobNumber: string;
  lotId: string;
  vendorId: string;
  type: "Dyeing" | "Printing" | "Dyeing + Printing";
  sentMeters: number;
  receivedMeters: number;
  lossMeters: number;
  ratePerMeter: number;
  expectedReturnDate: string;
  status: "Sent" | "Received";
  notes: string;
  createdAt: string;
};

type CuttingJob = {
  id: string;
  lotId: string;
  articleNumber: string;
  processedMetersUsed: number;
  frontCuttingMeters: number;
  backCuttingMeters: number;
  totalMetersPerSuit: number;
  suitsCreated: number;
  leftoverMeters: number;
  cuttingCost: number;
  notes: string;
  createdAt: string;
};

type EmbroideryJob = {
  id: string;
  jobNumber: string;
  articleId: string;
  vendorId: string;
  sentSuits: number;
  receivedASuits: number;
  bCategorySuits: number;
  missingSuits: number;
  ratePerSuit: number;
  expectedReturnDate: string;
  status: "Sent" | "Received";
  notes: string;
  createdAt: string;
};

type FinishedArticle = {
  id: string;
  articleNumber: string;
  sourceLotId: string;
  aCategorySuits: number;
  bCategorySuits: number;
  costPerSuit: number;
  aCategorySalePrice: number;
  bCategorySalePrice: number;
  stage: "Ready for Embroidery" | "Finished";
  notes: string;
};

type Sale = {
  id: string;
  date: string;
  customerId: string;
  articleId: string;
  category: "A Category" | "B Category";
  quantity: number;
  rate: number;
  total: number;
  paid: number;
  balance: number;
  paymentType: "Cash" | "Credit" | "Partial";
  notes: string;
};

type LedgerEntry = {
  id: string;
  date: string;
  partyId: string;
  partyName: string;
  partyType: "Customer" | "Supplier" | "Vendor";
  description: string;
  debit: number;
  credit: number;
  notes: string;
};

type PurchaseForm = {
  supplierName: string;
  lotNumber: string;
  clothType: string;
  quantityMeters: string;
  ratePerMeter: string;
  paidAmount: string;
  notes: string;
};

type ProcessingSendForm = {
  lotId: string;
  vendorName: string;
  quantitySent: string;
  type: ProcessingJob["type"];
  ratePerMeter: string;
  expectedReturnDate: string;
  notes: string;
};

type ProcessingReceiveForm = {
  jobId: string;
  receivedMeters: string;
};

type CuttingForm = {
  lotId: string;
  frontCuttingMeters: string;
  backCuttingMeters: string;
  articleNumber: string;
  cuttingCost: string;
  notes: string;
};

type EmbroiderySendForm = {
  articleId: string;
  vendorName: string;
  suitsSent: string;
  ratePerSuit: string;
  expectedReturnDate: string;
  notes: string;
};

type EmbroideryReceiveForm = {
  jobId: string;
  receivedSuits: string;
};

type SaleForm = {
  customerName: string;
  articleId: string;
  category: Sale["category"];
  quantity: string;
  rate: string;
  paidAmount: string;
  paymentType: Sale["paymentType"];
  notes: string;
};

type PaymentForm = {
  partyId: string;
  amount: string;
  note: string;
};

const sections: Section[] = [
  "Dashboard",
  "Kora Purchase",
  "Raw Stock / Lots",
  "Dyeing & Printing",
  "Cutting",
  "Embroidery",
  "Finished Stock",
  "Sales",
  "Customer Khata",
  "Supplier / Vendor Khata",
  "Reports",
];

const navGroups: Array<{ label: string; items: Section[] }> = [
  { label: "Overview", items: ["Dashboard", "Reports"] },
  { label: "Production", items: ["Kora Purchase", "Raw Stock / Lots", "Dyeing & Printing", "Cutting", "Embroidery"] },
  { label: "Stock & Sales", items: ["Finished Stock", "Sales"] },
  { label: "Ledgers", items: ["Customer Khata", "Supplier / Vendor Khata"] },
];

const navMeta: Record<Section, { icon: string; shortLabel: string; subtitle: string }> = {
  Dashboard: {
    icon: "◆",
    shortLabel: "Dashboard",
    subtitle: "Owner view for maal position, stock, credit, payable, and sales health.",
  },
  "Kora Purchase": {
    icon: "▣",
    shortLabel: "Purchase",
    subtitle: "Record kora kapra purchases in meters and supplier khata balances.",
  },
  "Raw Stock / Lots": {
    icon: "▤",
    shortLabel: "Lots",
    subtitle: "Track every raw lot before cutting: in shop, with vendor, processed, or cut.",
  },
  "Dyeing & Printing": {
    icon: "◈",
    shortLabel: "Dyeing",
    subtitle: "Send meters to dyeing or printing vendors and receive processed cloth with loss.",
  },
  Cutting: {
    icon: "⌁",
    shortLabel: "Cutting",
    subtitle: "Convert processed meters into suits using front and back cutting meters.",
  },
  Embroidery: {
    icon: "✦",
    shortLabel: "Embroidery",
    subtitle: "Send suits to embroidery and receive A category plus B category stock.",
  },
  "Finished Stock": {
    icon: "▥",
    shortLabel: "Stock",
    subtitle: "Manage A and B category finished suits, prices, cost, and profit.",
  },
  Sales: {
    icon: "◉",
    shortLabel: "Sales",
    subtitle: "Sell A or B category suits with cash, credit, or partial payment.",
  },
  "Customer Khata": {
    icon: "◇",
    shortLabel: "Customer Khata",
    subtitle: "Review customer balances and record payments received.",
  },
  "Supplier / Vendor Khata": {
    icon: "◍",
    shortLabel: "Vendor Khata",
    subtitle: "Review supplier and vendor payable balances and payments.",
  },
  Reports: {
    icon: "▦",
    shortLabel: "Reports",
    subtitle: "Business totals for purchases, processing, stock value, sales, and profit.",
  },
};

const today = "2026-05-24";

const seedSuppliers: Supplier[] = [
  { id: "sup-1", name: "Ahmed Textile", notes: "Kora kapra supplier" },
];

const seedVendors: Vendor[] = [
  { id: "ven-1", name: "Faisal Dyeing", service: "Dyeing" },
  { id: "ven-2", name: "Star Embroidery", service: "Embroidery" },
];

const seedCustomers: Customer[] = [{ id: "cus-1", name: "Ali Fabrics" }];

const seedRawLots: RawLot[] = [
  {
    id: "lot-1",
    lotNumber: "K-001",
    supplierId: "sup-1",
    clothType: "Cotton",
    purchasedMeters: 1000,
    rawAvailableMeters: 0,
    processedMeters: 0,
    ratePerMeter: 250,
    paidAmount: 150000,
    notes: "Opening kora purchase from Chiniot Bazaar flow",
    createdAt: "2026-05-01",
  },
];

const seedProcessingJobs: ProcessingJob[] = [
  {
    id: "proc-1",
    jobNumber: "DP-001",
    lotId: "lot-1",
    vendorId: "ven-1",
    type: "Dyeing + Printing",
    sentMeters: 1000,
    receivedMeters: 970,
    lossMeters: 30,
    ratePerMeter: 40,
    expectedReturnDate: "2026-05-07",
    status: "Received",
    notes: "Received after dyeing and printing",
    createdAt: "2026-05-03",
  },
];

const seedCuttingJobs: CuttingJob[] = [
  {
    id: "cut-1",
    lotId: "lot-1",
    articleNumber: "A-501",
    processedMetersUsed: 970,
    frontCuttingMeters: 1.5,
    backCuttingMeters: 1.5,
    totalMetersPerSuit: 3,
    suitsCreated: 323,
    leftoverMeters: 1,
    cuttingCost: 0,
    notes: "Cut from processed K-001",
    createdAt: "2026-05-10",
  },
];

const seedFinishedArticles: FinishedArticle[] = [
  {
    id: "art-1",
    articleNumber: "A-501",
    sourceLotId: "lot-1",
    aCategorySuits: 320,
    bCategorySuits: 3,
    costPerSuit: 1150,
    aCategorySalePrice: 1600,
    bCategorySalePrice: 1200,
    stage: "Finished",
    notes: "Ready packed stock after opening sale",
  },
];

const seedEmbroideryJobs: EmbroideryJob[] = [
  {
    id: "emb-1",
    jobNumber: "EMB-001",
    articleId: "art-1",
    vendorId: "ven-2",
    sentSuits: 323,
    receivedASuits: 320,
    bCategorySuits: 3,
    missingSuits: 0,
    ratePerSuit: 180,
    expectedReturnDate: "2026-05-15",
    status: "Received",
    notes: "Opening embroidery lot",
    createdAt: "2026-05-11",
  },
];

const seedSales: Sale[] = [
  {
    id: "sale-1",
    date: "2026-05-20",
    customerId: "cus-1",
    articleId: "art-1",
    category: "A Category",
    quantity: 20,
    rate: 1600,
    total: 32000,
    paid: 10000,
    balance: 22000,
    paymentType: "Partial",
    notes: "Partial credit sale",
  },
];

const seedLedgerEntries: LedgerEntry[] = [
  {
    id: "led-1",
    date: "2026-05-01",
    partyId: "sup-1",
    partyName: "Ahmed Textile",
    partyType: "Supplier",
    description: "Kora purchase Lot K-001",
    debit: 250000,
    credit: 150000,
    notes: "Balance 100000",
  },
  {
    id: "led-2",
    date: "2026-05-08",
    partyId: "ven-1",
    partyName: "Faisal Dyeing",
    partyType: "Vendor",
    description: "Dyeing + Printing K-001",
    debit: 40000,
    credit: 0,
    notes: "Processing payable",
  },
  {
    id: "led-3",
    date: "2026-05-16",
    partyId: "ven-2",
    partyName: "Star Embroidery",
    partyType: "Vendor",
    description: "Embroidery Article A-501",
    debit: 57600,
    credit: 0,
    notes: "Embroidery payable",
  },
  {
    id: "led-4",
    date: "2026-05-20",
    partyId: "cus-1",
    partyName: "Ali Fabrics",
    partyType: "Customer",
    description: "Sale Article A-501",
    debit: 32000,
    credit: 10000,
    notes: "Partial credit balance",
  },
];

function formatPKR(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMeters(value: number) {
  return `${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 }).format(value)} m`;
}

function formatSuits(value: number) {
  return `${new Intl.NumberFormat("en-PK").format(value)} suits`;
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function balanceFor(entries: LedgerEntry[], partyId: string) {
  return entries
    .filter((entry) => entry.partyId === partyId)
    .reduce((total, entry) => total + entry.debit - entry.credit, 0);
}

function getLotStatus(lot: RawLot, processingJobs: ProcessingJob[], cuttingJobs: CuttingJob[]) {
  const sentMeters = processingJobs
    .filter((job) => job.lotId === lot.id && job.status === "Sent")
    .reduce((sum, job) => sum + job.sentMeters, 0);
  const hasCutting = cuttingJobs.some((job) => job.lotId === lot.id);

  if (hasCutting && lot.rawAvailableMeters === 0 && lot.processedMeters === 0) {
    return "Cut Into Suits";
  }
  if (sentMeters > 0) return "Sent to Dyeing";
  if (lot.processedMeters > 0 && lot.rawAvailableMeters > 0) return "Partially Processed";
  if (lot.processedMeters > 0) return "Ready for Cutting";
  return "In Shop";
}

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("Dashboard");
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers);
  const [vendors, setVendors] = useState<Vendor[]>(seedVendors);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [rawLots, setRawLots] = useState<RawLot[]>(seedRawLots);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>(seedProcessingJobs);
  const [cuttingJobs, setCuttingJobs] = useState<CuttingJob[]>(seedCuttingJobs);
  const [embroideryJobs, setEmbroideryJobs] = useState<EmbroideryJob[]>(seedEmbroideryJobs);
  const [finishedArticles, setFinishedArticles] = useState<FinishedArticle[]>(seedFinishedArticles);
  const [sales, setSales] = useState<Sale[]>(seedSales);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(seedLedgerEntries);

  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({
    supplierName: "",
    lotNumber: "",
    clothType: "",
    quantityMeters: "",
    ratePerMeter: "",
    paidAmount: "",
    notes: "",
  });
  const [processingSendForm, setProcessingSendForm] = useState<ProcessingSendForm>({
    lotId: "lot-1",
    vendorName: "",
    quantitySent: "",
    type: "Dyeing + Printing",
    ratePerMeter: "",
    expectedReturnDate: "2026-06-01",
    notes: "",
  });
  const [processingReceiveForm, setProcessingReceiveForm] = useState<ProcessingReceiveForm>({
    jobId: "",
    receivedMeters: "",
  });
  const [cuttingForm, setCuttingForm] = useState<CuttingForm>({
    lotId: "lot-1",
    frontCuttingMeters: "1.5",
    backCuttingMeters: "1.5",
    articleNumber: "",
    cuttingCost: "",
    notes: "",
  });
  const [embroiderySendForm, setEmbroiderySendForm] = useState<EmbroiderySendForm>({
    articleId: "art-1",
    vendorName: "",
    suitsSent: "",
    ratePerSuit: "",
    expectedReturnDate: "2026-06-05",
    notes: "",
  });
  const [embroideryReceiveForm, setEmbroideryReceiveForm] = useState<EmbroideryReceiveForm>({
    jobId: "",
    receivedSuits: "",
  });
  const [saleForm, setSaleForm] = useState<SaleForm>({
    customerName: "",
    articleId: "art-1",
    category: "A Category",
    quantity: "",
    rate: "1600",
    paidAmount: "",
    paymentType: "Partial",
    notes: "",
  });
  const [customerPaymentForm, setCustomerPaymentForm] = useState<PaymentForm>({
    partyId: "cus-1",
    amount: "",
    note: "",
  });
  const [payablePaymentForm, setPayablePaymentForm] = useState<PaymentForm>({
    partyId: "sup-1",
    amount: "",
    note: "",
  });

  const totals = useMemo(() => {
    const rawInShop = rawLots.reduce((sum, lot) => sum + lot.rawAvailableMeters, 0);
    const withProcessing = processingJobs
      .filter((job) => job.status === "Sent")
      .reduce((sum, job) => sum + job.sentMeters, 0);
    const processedReady = rawLots.reduce((sum, lot) => sum + lot.processedMeters, 0);
    const withEmbroidery = embroideryJobs
      .filter((job) => job.status === "Sent")
      .reduce((sum, job) => sum + job.sentSuits, 0);
    const readyAStock = finishedArticles.reduce((sum, article) => sum + article.aCategorySuits, 0);
    const readyBStock = finishedArticles.reduce((sum, article) => sum + article.bCategorySuits, 0);
    const readyStock = readyAStock + readyBStock;
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalReceived = sales.reduce((sum, sale) => sum + sale.paid, 0);
    const customerCredit = ledgerEntries
      .filter((entry) => entry.partyType === "Customer")
      .reduce((sum, entry) => sum + entry.debit - entry.credit, 0);
    const supplierPayable = ledgerEntries
      .filter((entry) => entry.partyType === "Supplier")
      .reduce((sum, entry) => sum + entry.debit - entry.credit, 0);
    const vendorPayable = ledgerEntries
      .filter((entry) => entry.partyType === "Vendor")
      .reduce((sum, entry) => sum + entry.debit - entry.credit, 0);
    const processingCost = processingJobs.reduce(
      (sum, job) => sum + (job.status === "Received" ? job.sentMeters * job.ratePerMeter : 0),
      0,
    );
    const embroideryCost = embroideryJobs.reduce(
      (sum, job) => sum + (job.status === "Received" ? job.sentSuits * job.ratePerSuit : 0),
      0,
    );
    const purchases = rawLots.reduce((sum, lot) => sum + lot.purchasedMeters * lot.ratePerMeter, 0);
    const rawMetersPurchased = rawLots.reduce((sum, lot) => sum + lot.purchasedMeters, 0);
    const aCategoryStockValue = finishedArticles.reduce(
      (sum, article) => sum + article.aCategorySuits * article.costPerSuit,
      0,
    );
    const bCategoryStockValue = finishedArticles.reduce(
      (sum, article) => sum + article.bCategorySuits * article.costPerSuit,
      0,
    );
    const readyStockValue = aCategoryStockValue + bCategoryStockValue;
    const estimatedProfit = sales.reduce((sum, sale) => {
      const article = finishedArticles.find((item) => item.id === sale.articleId);
      return sum + sale.quantity * (sale.rate - (article?.costPerSuit ?? 0));
    }, 0);
    const estimatedAProfit = sales.reduce((sum, sale) => {
      const article = finishedArticles.find((item) => item.id === sale.articleId);
      return sale.category === "A Category" ? sum + sale.quantity * (sale.rate - (article?.costPerSuit ?? 0)) : sum;
    }, 0);
    const estimatedBProfit = sales.reduce((sum, sale) => {
      const article = finishedArticles.find((item) => item.id === sale.articleId);
      return sale.category === "B Category" ? sum + sale.quantity * (sale.rate - (article?.costPerSuit ?? 0)) : sum;
    }, 0);
    const processingLoss = processingJobs.reduce((sum, job) => sum + job.lossMeters, 0);
    const bCategoryQuantity = finishedArticles.reduce((sum, article) => sum + article.bCategorySuits, 0);
    const embroideryBCategory = embroideryJobs.reduce((sum, job) => sum + job.bCategorySuits, 0);
    const embroideryMissing = embroideryJobs.reduce((sum, job) => sum + job.missingSuits, 0);

    return {
      rawInShop,
      withProcessing,
      processedReady,
      withEmbroidery,
      readyAStock,
      readyBStock,
      readyStock,
      totalSales,
      totalReceived,
      customerCredit,
      supplierPayable,
      vendorPayable,
      supplierVendorPayable: supplierPayable + vendorPayable,
      processingCost,
      embroideryCost,
      purchases,
      rawMetersPurchased,
      aCategoryStockValue,
      bCategoryStockValue,
      readyStockValue,
      estimatedProfit,
      estimatedAProfit,
      estimatedBProfit,
      processingLoss,
      bCategoryQuantity,
      embroideryBCategory,
      embroideryMissing,
    };
  }, [rawLots, processingJobs, embroideryJobs, finishedArticles, sales, ledgerEntries]);

  const customerSummaries = useMemo(
    () =>
      customers.map((customer) => {
        const customerSales = sales.filter((sale) => sale.customerId === customer.id);
        const entries = ledgerEntries.filter((entry) => entry.partyId === customer.id);
        return {
          customer,
          totalSales: customerSales.reduce((sum, sale) => sum + sale.total, 0),
          totalPaid: entries.reduce((sum, entry) => sum + entry.credit, 0),
          balance: balanceFor(ledgerEntries, customer.id),
          lastSaleDate: customerSales.at(-1)?.date ?? "-",
        };
      }),
    [customers, sales, ledgerEntries],
  );

  const payableSummaries = useMemo(() => {
    const supplierRows = suppliers.map((supplier) => {
      const entries = ledgerEntries.filter((entry) => entry.partyId === supplier.id);
      return {
        id: supplier.id,
        name: supplier.name,
        type: "Supplier" as const,
        payable: entries.reduce((sum, entry) => sum + entry.debit, 0),
        paid: entries.reduce((sum, entry) => sum + entry.credit, 0),
        balance: balanceFor(ledgerEntries, supplier.id),
        lastActivity: entries.at(-1)?.date ?? "-",
        notes: supplier.notes ?? "",
      };
    });
    const vendorRows = vendors.map((vendor) => {
      const entries = ledgerEntries.filter((entry) => entry.partyId === vendor.id);
      return {
        id: vendor.id,
        name: vendor.name,
        type: "Vendor" as const,
        payable: entries.reduce((sum, entry) => sum + entry.debit, 0),
        paid: entries.reduce((sum, entry) => sum + entry.credit, 0),
        balance: balanceFor(ledgerEntries, vendor.id),
        lastActivity: entries.at(-1)?.date ?? "-",
        notes: vendor.notes ?? vendor.service,
      };
    });
    return [...supplierRows, ...vendorRows];
  }, [suppliers, vendors, ledgerEntries]);

  function supplierName(id: string) {
    return suppliers.find((supplier) => supplier.id === id)?.name ?? "Unknown Supplier";
  }

  function vendorName(id: string) {
    return vendors.find((vendor) => vendor.id === id)?.name ?? "Unknown Vendor";
  }

  function customerName(id: string) {
    return customers.find((customer) => customer.id === id)?.name ?? "Unknown Customer";
  }

  function lotNumber(id: string) {
    return rawLots.find((lot) => lot.id === id)?.lotNumber ?? "Unknown Lot";
  }

  function articleNumber(id: string) {
    return finishedArticles.find((article) => article.id === id)?.articleNumber ?? "Unknown Article";
  }

  function findOrCreateSupplier(name: string) {
    const existing = suppliers.find((supplier) => supplier.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const next = { id: makeId("sup"), name };
    setSuppliers((current) => [...current, next]);
    return next;
  }

  function findOrCreateVendor(name: string, service: Vendor["service"]) {
    const existing = vendors.find((vendor) => vendor.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const next = { id: makeId("ven"), name, service };
    setVendors((current) => [...current, next]);
    return next;
  }

  function findOrCreateCustomer(name: string) {
    const existing = customers.find((customer) => customer.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const next = { id: makeId("cus"), name };
    setCustomers((current) => [...current, next]);
    return next;
  }

  function handlePurchaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supplier = purchaseForm.supplierName.trim();
    const lotNumberValue = purchaseForm.lotNumber.trim();
    const clothType = purchaseForm.clothType.trim();
    const quantity = toNumber(purchaseForm.quantityMeters);
    const rate = toNumber(purchaseForm.ratePerMeter);
    const paid = toNumber(purchaseForm.paidAmount);
    const total = quantity * rate;
    const balance = total - paid;

    if (!supplier || !lotNumberValue || !clothType || quantity <= 0 || rate <= 0 || paid < 0) {
      alert("Please enter valid purchase details.");
      return;
    }
    if (paid > total) {
      alert("Paid amount cannot be greater than purchase total.");
      return;
    }
    if (rawLots.some((lot) => lot.lotNumber.toLowerCase() === lotNumberValue.toLowerCase())) {
      alert("This lot number already exists.");
      return;
    }

    const supplierRecord = findOrCreateSupplier(supplier);
    const lotId = makeId("lot");
    setRawLots((current) => [
      ...current,
      {
        id: lotId,
        lotNumber: lotNumberValue,
        supplierId: supplierRecord.id,
        clothType,
        purchasedMeters: quantity,
        rawAvailableMeters: quantity,
        processedMeters: 0,
        ratePerMeter: rate,
        paidAmount: paid,
        notes: purchaseForm.notes,
        createdAt: today,
      },
    ]);

    if (balance > 0 || paid > 0) {
      setLedgerEntries((current) => [
        ...current,
        {
          id: makeId("led"),
          date: today,
          partyId: supplierRecord.id,
          partyName: supplierRecord.name,
          partyType: "Supplier",
          description: `Kora purchase Lot ${lotNumberValue}`,
          debit: total,
          credit: paid,
          notes: purchaseForm.notes,
        },
      ]);
    }

    setPurchaseForm({
      supplierName: "",
      lotNumber: "",
      clothType: "",
      quantityMeters: "",
      ratePerMeter: "",
      paidAmount: "",
      notes: "",
    });
  }

  function handleProcessingSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lot = rawLots.find((item) => item.id === processingSendForm.lotId);
    const vendor = processingSendForm.vendorName.trim();
    const sent = toNumber(processingSendForm.quantitySent);
    const rate = toNumber(processingSendForm.ratePerMeter);

    if (!lot || !vendor || sent <= 0 || rate < 0) {
      alert("Please enter valid dyeing/printing send details.");
      return;
    }
    if (sent > lot.rawAvailableMeters) {
      alert("Cannot send more than raw available meters.");
      return;
    }

    const vendorRecord = findOrCreateVendor(vendor, "Dyeing");
    setRawLots((current) =>
      current.map((item) =>
        item.id === lot.id ? { ...item, rawAvailableMeters: item.rawAvailableMeters - sent } : item,
      ),
    );
    setProcessingJobs((current) => [
      ...current,
      {
        id: makeId("proc"),
        jobNumber: `DP-${String(current.length + 1).padStart(3, "0")}`,
        lotId: lot.id,
        vendorId: vendorRecord.id,
        type: processingSendForm.type,
        sentMeters: sent,
        receivedMeters: 0,
        lossMeters: 0,
        ratePerMeter: rate,
        expectedReturnDate: processingSendForm.expectedReturnDate,
        status: "Sent",
        notes: processingSendForm.notes,
        createdAt: today,
      },
    ]);
    setProcessingSendForm({
      lotId: lot.id,
      vendorName: "",
      quantitySent: "",
      type: "Dyeing + Printing",
      ratePerMeter: "",
      expectedReturnDate: "2026-06-01",
      notes: "",
    });
  }

  function handleProcessingReceive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const job = processingJobs.find((item) => item.id === processingReceiveForm.jobId);
    const received = toNumber(processingReceiveForm.receivedMeters);

    if (!job || received < 0) {
      alert("Please select a sent job and enter received meters.");
      return;
    }
    if (received > job.sentMeters) {
      alert("Received meters cannot be greater than sent meters.");
      return;
    }

    const payable = job.sentMeters * job.ratePerMeter;
    setProcessingJobs((current) =>
      current.map((item) =>
        item.id === job.id
          ? {
              ...item,
              receivedMeters: received,
              lossMeters: item.sentMeters - received,
              status: "Received",
            }
          : item,
      ),
    );
    setRawLots((current) =>
      current.map((lot) =>
        lot.id === job.lotId ? { ...lot, processedMeters: lot.processedMeters + received } : lot,
      ),
    );
    setLedgerEntries((current) => [
      ...current,
      {
        id: makeId("led"),
        date: today,
        partyId: job.vendorId,
        partyName: vendorName(job.vendorId),
        partyType: "Vendor",
        description: `${job.type} ${lotNumber(job.lotId)}`,
        debit: payable,
        credit: 0,
        notes: `Loss ${formatMeters(job.sentMeters - received)}`,
      },
    ]);
    setProcessingReceiveForm({ jobId: "", receivedMeters: "" });
  }

  function handleCutting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lot = rawLots.find((item) => item.id === cuttingForm.lotId);
    const frontCuttingMeters = toNumber(cuttingForm.frontCuttingMeters);
    const backCuttingMeters = toNumber(cuttingForm.backCuttingMeters);
    const totalMetersPerSuit = frontCuttingMeters + backCuttingMeters;
    const articleNumberValue = cuttingForm.articleNumber.trim();
    const cuttingCost = toNumber(cuttingForm.cuttingCost);

    if (!lot || frontCuttingMeters <= 0 || backCuttingMeters <= 0 || totalMetersPerSuit <= 0 || !articleNumberValue || cuttingCost < 0) {
      alert("Please enter valid cutting details.");
      return;
    }
    if (lot.processedMeters < totalMetersPerSuit) {
      alert("This lot does not have enough processed meters for cutting.");
      return;
    }
    if (finishedArticles.some((article) => article.articleNumber.toLowerCase() === articleNumberValue.toLowerCase())) {
      alert("This article number already exists.");
      return;
    }

    const suitsCreated = Math.floor(lot.processedMeters / totalMetersPerSuit);
    const leftover = lot.processedMeters % totalMetersPerSuit;
    const purchaseCost = lot.ratePerMeter * totalMetersPerSuit;
    const processingCostPerSuit =
      processingJobs
        .filter((job) => job.lotId === lot.id)
        .reduce((sum, job) => sum + job.ratePerMeter, 0) * totalMetersPerSuit;
    const costPerSuit = Math.round(purchaseCost + processingCostPerSuit + cuttingCost / suitsCreated);

    setRawLots((current) =>
      current.map((item) => (item.id === lot.id ? { ...item, processedMeters: 0 } : item)),
    );
    setCuttingJobs((current) => [
      ...current,
      {
        id: makeId("cut"),
        lotId: lot.id,
        articleNumber: articleNumberValue,
        processedMetersUsed: lot.processedMeters,
        frontCuttingMeters,
        backCuttingMeters,
        totalMetersPerSuit,
        suitsCreated,
        leftoverMeters: leftover,
        cuttingCost,
        notes: cuttingForm.notes,
        createdAt: today,
      },
    ]);
    setFinishedArticles((current) => [
      ...current,
      {
        id: makeId("art"),
        articleNumber: articleNumberValue,
        sourceLotId: lot.id,
        aCategorySuits: suitsCreated,
        bCategorySuits: 0,
        costPerSuit,
        aCategorySalePrice: Math.round(costPerSuit * 1.35),
        bCategorySalePrice: Math.round(costPerSuit * 1.1),
        stage: "Ready for Embroidery",
        notes: cuttingForm.notes,
      },
    ]);
    setCuttingForm({
      lotId: lot.id,
      frontCuttingMeters: "1.5",
      backCuttingMeters: "1.5",
      articleNumber: "",
      cuttingCost: "",
      notes: "",
    });
  }

  function handleEmbroiderySend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const article = finishedArticles.find((item) => item.id === embroiderySendForm.articleId);
    const vendor = embroiderySendForm.vendorName.trim();
    const sent = toNumber(embroiderySendForm.suitsSent);
    const rate = toNumber(embroiderySendForm.ratePerSuit);

    if (!article || !vendor || sent <= 0 || rate < 0) {
      alert("Please enter valid embroidery send details.");
      return;
    }
    if (sent > article.aCategorySuits) {
      alert("Cannot send more suits than available stock.");
      return;
    }

    const vendorRecord = findOrCreateVendor(vendor, "Embroidery");
    setFinishedArticles((current) =>
      current.map((item) =>
        item.id === article.id ? { ...item, aCategorySuits: item.aCategorySuits - sent } : item,
      ),
    );
    setEmbroideryJobs((current) => [
      ...current,
      {
        id: makeId("emb"),
        jobNumber: `EMB-${String(current.length + 1).padStart(3, "0")}`,
        articleId: article.id,
        vendorId: vendorRecord.id,
        sentSuits: sent,
        receivedASuits: 0,
        bCategorySuits: 0,
        missingSuits: 0,
        ratePerSuit: rate,
        expectedReturnDate: embroiderySendForm.expectedReturnDate,
        status: "Sent",
        notes: embroiderySendForm.notes,
        createdAt: today,
      },
    ]);
    setEmbroiderySendForm({
      articleId: article.id,
      vendorName: "",
      suitsSent: "",
      ratePerSuit: "",
      expectedReturnDate: "2026-06-05",
      notes: "",
    });
  }

  function handleEmbroideryReceive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const job = embroideryJobs.find((item) => item.id === embroideryReceiveForm.jobId);
    const received = toNumber(embroideryReceiveForm.receivedSuits);

    if (!job || received < 0) {
      alert("Please select a sent embroidery job and enter received suits.");
      return;
    }
    if (received > job.sentSuits) {
      alert("Received suits cannot be greater than sent suits.");
      return;
    }

    const bCategorySuits = job.sentSuits - received;
    const payable = job.sentSuits * job.ratePerSuit;
    setEmbroideryJobs((current) =>
      current.map((item) =>
        item.id === job.id
          ? {
              ...item,
              receivedASuits: received,
              bCategorySuits,
              missingSuits: 0,
              status: "Received",
            }
          : item,
      ),
    );
    setFinishedArticles((current) =>
      current.map((article) =>
        article.id === job.articleId
          ? {
              ...article,
              aCategorySuits: article.aCategorySuits + received,
              bCategorySuits: article.bCategorySuits + bCategorySuits,
              stage: "Finished",
            }
          : article,
      ),
    );
    setLedgerEntries((current) => [
      ...current,
      {
        id: makeId("led"),
        date: today,
        partyId: job.vendorId,
        partyName: vendorName(job.vendorId),
        partyType: "Vendor",
        description: `Embroidery ${articleNumber(job.articleId)}`,
        debit: payable,
        credit: 0,
        notes: `B category ${formatSuits(bCategorySuits)}`,
      },
    ]);
    setEmbroideryReceiveForm({ jobId: "", receivedSuits: "" });
  }

  function handleSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const article = finishedArticles.find((item) => item.id === saleForm.articleId);
    const customer = saleForm.customerName.trim();
    const quantity = toNumber(saleForm.quantity);
    const rate = toNumber(saleForm.rate);
    const paid = toNumber(saleForm.paidAmount);
    const total = quantity * rate;
    const balance = total - paid;

    if (!article || !customer || quantity <= 0 || rate <= 0 || paid < 0) {
      alert("Please enter valid sale details.");
      return;
    }
    const categoryStock = saleForm.category === "A Category" ? article.aCategorySuits : article.bCategorySuits;
    if (quantity > categoryStock) {
      alert(`Cannot sell more suits than available ${saleForm.category} stock.`);
      return;
    }
    if (paid > total) {
      alert("Paid amount cannot be greater than sale total.");
      return;
    }

    const customerRecord = findOrCreateCustomer(customer);
    setFinishedArticles((current) =>
      current.map((item) =>
        item.id === article.id
          ? saleForm.category === "A Category"
            ? { ...item, aCategorySuits: item.aCategorySuits - quantity }
            : { ...item, bCategorySuits: item.bCategorySuits - quantity }
          : item,
      ),
    );
    setSales((current) => [
      ...current,
      {
        id: makeId("sale"),
        date: today,
        customerId: customerRecord.id,
        articleId: article.id,
        category: saleForm.category,
        quantity,
        rate,
        total,
        paid,
        balance,
        paymentType: saleForm.paymentType,
        notes: saleForm.notes,
      },
    ]);
    setLedgerEntries((current) => [
      ...current,
      {
        id: makeId("led"),
        date: today,
        partyId: customerRecord.id,
        partyName: customerRecord.name,
        partyType: "Customer",
        description: `Sale ${article.articleNumber} ${saleForm.category}`,
        debit: total,
        credit: paid,
        notes: saleForm.notes,
      },
    ]);
    setSaleForm({
      customerName: "",
      articleId: article.id,
      category: saleForm.category,
      quantity: "",
      rate: String(saleForm.category === "A Category" ? article.aCategorySalePrice : article.bCategorySalePrice),
      paidAmount: "",
      paymentType: "Partial",
      notes: "",
    });
  }

  function handleCustomerPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const customer = customers.find((item) => item.id === customerPaymentForm.partyId);
    const amount = toNumber(customerPaymentForm.amount);
    if (!customer || amount <= 0) {
      alert("Please select customer and enter valid payment.");
      return;
    }
    if (amount > balanceFor(ledgerEntries, customer.id)) {
      alert("Payment cannot be greater than customer balance.");
      return;
    }
    setLedgerEntries((current) => [
      ...current,
      {
        id: makeId("led"),
        date: today,
        partyId: customer.id,
        partyName: customer.name,
        partyType: "Customer",
        description: "Customer payment received",
        debit: 0,
        credit: amount,
        notes: customerPaymentForm.note,
      },
    ]);
    setCustomerPaymentForm({ partyId: customer.id, amount: "", note: "" });
  }

  function handlePayablePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const party = payableSummaries.find((item) => item.id === payablePaymentForm.partyId);
    const amount = toNumber(payablePaymentForm.amount);
    if (!party || amount <= 0) {
      alert("Please select supplier/vendor and enter valid payment.");
      return;
    }
    if (amount > balanceFor(ledgerEntries, party.id)) {
      alert("Payment cannot be greater than payable balance.");
      return;
    }
    setLedgerEntries((current) => [
      ...current,
      {
        id: makeId("led"),
        date: today,
        partyId: party.id,
        partyName: party.name,
        partyType: party.type,
        description: `${party.type} payment paid`,
        debit: 0,
        credit: amount,
        notes: payablePaymentForm.note,
      },
    ]);
    setPayablePaymentForm({ partyId: party.id, amount: "", note: "" });
  }

  function updateArticlePrice(articleId: string, field: "costPerSuit" | "aCategorySalePrice" | "bCategorySalePrice", value: string) {
    const amount = toNumber(value);
    setFinishedArticles((current) =>
      current.map((article) => (article.id === articleId ? { ...article, [field]: amount } : article)),
    );
  }

  const activeTitle =
    activeSection === "Dashboard"
      ? "Ali Pasha Fabrics System"
      : activeSection;
  const activeSubtitle = navMeta[activeSection].subtitle;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6f8] text-[#111827]">
      <aside className="hidden h-screen min-h-0 w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="shrink-0 border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">
              AP
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight text-slate-950">Ali Pasha Fabrics</h1>
              <p className="mt-0.5 text-xs text-slate-500">Textile Workflow System</p>
            </div>
          </div>
          <span className="mt-3 inline-flex rounded-full border border-teal-100 bg-[#eefdf8] px-2.5 py-1 text-[11px] font-medium text-[#0f766e]">
            Chiniot Bazaar
          </span>
        </div>

        <nav className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map((section) => (
                    <button
                      key={section}
                      type="button"
                      onClick={() => setActiveSection(section)}
                      className={classNames(
                        "relative flex h-10 w-full items-center gap-2.5 rounded-[10px] px-3 text-left text-sm font-medium transition",
                        activeSection === section
                          ? "bg-[#eefdf8] text-[#0f766e]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                      )}
                    >
                      {activeSection === section ? <span className="absolute left-0 top-2.5 h-5 w-0.5 rounded-full bg-[#0f766e]" /> : null}
                      <span className="w-5 text-center text-xs text-slate-400">{navMeta[section].icon}</span>
                      <span className="min-w-0 truncate">{navMeta[section].shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
            <p className="text-xs font-medium text-slate-700">Demo mode</p>
            <p className="text-[11px] text-slate-500">Local state only</p>
          </div>
        </div>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-8 py-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#0f766e]">Textile Operations</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#111827]">{activeTitle}</h2>
                <p className="mt-0.5 max-w-3xl text-sm leading-5 text-[#64748b]">{activeSubtitle}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">Meters before cutting</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">Suits after cutting</span>
                <span className="rounded-full border border-teal-100 bg-[#eefdf8] px-3 py-1.5 text-[#0f766e]">Local demo</span>
              </div>
              <select
                value={activeSection}
                onChange={(event) => setActiveSection(event.target.value as Section)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm lg:hidden"
              >
                {sections.map((section) => (
                  <option key={section}>{section}</option>
                ))}
              </select>
            </div>
        </header>

        <div className="space-y-4 px-6 py-5 lg:px-7">{renderSection()}</div>
      </main>
    </div>
  );

  function renderSection() {
    switch (activeSection) {
      case "Dashboard":
        return (
          <>
            <DashboardHero
              readyStock={formatSuits(totals.readyStock)}
              customerCredit={formatPKR(totals.customerCredit)}
              vendorPayable={formatPKR(totals.vendorPayable)}
            />
            <WorkflowJourney />
            <Panel title="Business Snapshot" subtitle="Live owner-level totals from purchases, processing, stock, sales, and khata.">
              <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard label="A stock" value={formatSuits(totals.readyAStock)} helper="Prime suits" tone="emerald" />
                <MetricCard label="B stock" value={formatSuits(totals.readyBStock)} helper="Sellable B category" tone="amber" />
                <MetricCard label="Customer credit" value={formatPKR(totals.customerCredit)} helper="Receivable khata" tone="rose" />
                <MetricCard label="Vendor payable" value={formatPKR(totals.supplierVendorPayable)} helper="Supplier/vendor dues" tone="amber" />
                <MetricCard label="Sales" value={formatPKR(totals.totalSales)} helper="Gross sales" tone="slate" />
                <MetricCard label="Profit" value={formatPKR(totals.estimatedProfit)} helper="Estimated margin" tone="emerald" />
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">Full Snapshot</p>
                <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                  <MetricCard label="Raw cloth" value={formatMeters(totals.rawInShop)} helper="In shop meters" tone="emerald" compact />
                  <MetricCard label="With dyeing" value={formatMeters(totals.withProcessing)} helper="Vendor maal" tone="amber" compact />
                  <MetricCard label="Ready cutting" value={formatMeters(totals.processedReady)} helper="Processed meters" tone="sky" compact />
                  <MetricCard label="With embroidery" value={formatSuits(totals.withEmbroidery)} helper="Vendor suits" tone="violet" compact />
                </div>
              </div>
            </Panel>
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Panel
                title="Owner Questions"
                subtitle="The four questions a kapra business owner checks first."
              >
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <FocusItem label="Where is my maal?" value={`${formatMeters(totals.withProcessing)} with processing, ${formatSuits(totals.withEmbroidery)} at embroidery`} />
                  <FocusItem label="Who owes me money?" value={formatPKR(totals.customerCredit)} badge="Customer credit" tone="rose" />
                  <FocusItem label="Who do I owe money to?" value={formatPKR(totals.supplierVendorPayable)} badge="Payables" tone="amber" />
                  <FocusItem label="What stock is ready?" value={`${formatSuits(totals.readyAStock)} A, ${formatSuits(totals.readyBStock)} B`} badge="Ready stock" tone="emerald" />
                </div>
              </Panel>
              <Panel
                title="Today's Pulse"
                subtitle="Meters stay before cutting. Suits and categories start after cutting."
              >
                <div className="divide-y divide-slate-100">
                  <DashboardLine label="Ready A stock" value={formatSuits(totals.readyAStock)} tone="success" />
                  <DashboardLine label="Ready B stock" value={formatSuits(totals.readyBStock)} tone="warning" />
                  <DashboardLine label="Customer credit" value={formatPKR(totals.customerCredit)} tone="danger" />
                  <DashboardLine label="Vendor payable" value={formatPKR(totals.vendorPayable)} tone="warning" />
                  <DashboardLine label="Estimated profit" value={formatPKR(totals.estimatedProfit)} tone="success" />
                </div>
              </Panel>
            </div>
          </>
        );
      case "Kora Purchase":
        return (
          <TwoColumn
            left={
              <Panel title="Add Kora Purchase">
                <form onSubmit={handlePurchaseSubmit} className="grid gap-3">
                  <TextInput label="Supplier name" value={purchaseForm.supplierName} onChange={(value) => setPurchaseForm({ ...purchaseForm, supplierName: value })} placeholder="Ahmed Textile" />
                  <TextInput label="Lot number" value={purchaseForm.lotNumber} onChange={(value) => setPurchaseForm({ ...purchaseForm, lotNumber: value })} placeholder="K-002" />
                  <TextInput label="Cloth type" value={purchaseForm.clothType} onChange={(value) => setPurchaseForm({ ...purchaseForm, clothType: value })} placeholder="Cotton" />
                  <NumberInput label="Quantity (meters)" value={purchaseForm.quantityMeters} onChange={(value) => setPurchaseForm({ ...purchaseForm, quantityMeters: value })} />
                  <NumberInput label="Rate per meter (PKR)" value={purchaseForm.ratePerMeter} onChange={(value) => setPurchaseForm({ ...purchaseForm, ratePerMeter: value })} />
                  <NumberInput label="Paid amount (PKR)" value={purchaseForm.paidAmount} onChange={(value) => setPurchaseForm({ ...purchaseForm, paidAmount: value })} />
                  <TextArea label="Notes" value={purchaseForm.notes} onChange={(value) => setPurchaseForm({ ...purchaseForm, notes: value })} />
                  <CalcLine label="Total" value={formatPKR(toNumber(purchaseForm.quantityMeters) * toNumber(purchaseForm.ratePerMeter))} />
                  <CalcLine label="Balance" value={formatPKR(toNumber(purchaseForm.quantityMeters) * toNumber(purchaseForm.ratePerMeter) - toNumber(purchaseForm.paidAmount))} />
                  <PrimaryButton>Add Purchase</PrimaryButton>
                </form>
              </Panel>
            }
            right={
              <Panel title="All Purchases / Lots">
                {rawLotsTable()}
              </Panel>
            }
          />
        );
      case "Raw Stock / Lots":
        return (
          <Panel title="Raw Stock / Lots">
            {rawLotsTable()}
          </Panel>
        );
      case "Dyeing & Printing":
        return (
          <>
            <TwoColumn
              left={
                <Panel title="Send to Dyeing">
                  <form onSubmit={handleProcessingSend} className="grid gap-3">
                    <SelectInput label="Select lot" value={processingSendForm.lotId} onChange={(value) => setProcessingSendForm({ ...processingSendForm, lotId: value })} options={rawLots.filter((lot) => lot.rawAvailableMeters > 0).map((lot) => ({ value: lot.id, label: `${lot.lotNumber} - ${formatMeters(lot.rawAvailableMeters)} raw` }))} />
                    <TextInput label="Vendor name" value={processingSendForm.vendorName} onChange={(value) => setProcessingSendForm({ ...processingSendForm, vendorName: value })} placeholder="Faisal Dyeing" />
                    <NumberInput label="Quantity sent (meters)" value={processingSendForm.quantitySent} onChange={(value) => setProcessingSendForm({ ...processingSendForm, quantitySent: value })} />
                    <SelectInput label="Processing type" value={processingSendForm.type} onChange={(value) => setProcessingSendForm({ ...processingSendForm, type: value as ProcessingJob["type"] })} options={["Dyeing", "Printing", "Dyeing + Printing"].map((value) => ({ value, label: value }))} />
                    <NumberInput label="Rate per meter (PKR)" value={processingSendForm.ratePerMeter} onChange={(value) => setProcessingSendForm({ ...processingSendForm, ratePerMeter: value })} />
                    <TextInput label="Expected return date" type="date" value={processingSendForm.expectedReturnDate} onChange={(value) => setProcessingSendForm({ ...processingSendForm, expectedReturnDate: value })} />
                    <TextArea label="Notes" value={processingSendForm.notes} onChange={(value) => setProcessingSendForm({ ...processingSendForm, notes: value })} />
                    <PrimaryButton>Send to Dyeing</PrimaryButton>
                  </form>
                </Panel>
              }
              right={
                <Panel title="Receive Stock">
                  <form onSubmit={handleProcessingReceive} className="grid gap-3">
                    <SelectInput label="Select sent processing job" value={processingReceiveForm.jobId} onChange={(value) => setProcessingReceiveForm({ ...processingReceiveForm, jobId: value })} options={processingJobs.filter((job) => job.status === "Sent").map((job) => ({ value: job.id, label: `${job.jobNumber} - ${lotNumber(job.lotId)} - ${formatMeters(job.sentMeters)}` }))} />
                    <NumberInput label="Received meters" value={processingReceiveForm.receivedMeters} onChange={(value) => setProcessingReceiveForm({ ...processingReceiveForm, receivedMeters: value })} />
                    <CalcLine label="Loss" value={processingReceiveForm.jobId ? formatMeters((processingJobs.find((job) => job.id === processingReceiveForm.jobId)?.sentMeters ?? 0) - toNumber(processingReceiveForm.receivedMeters)) : formatMeters(0)} />
                    <PrimaryButton>Receive Stock</PrimaryButton>
                  </form>
                </Panel>
              }
            />
            <Panel title="Dyeing & Printing Jobs">
              <DataTable
                headers={["Job", "Lot", "Vendor", "Type", "Sent", "Received", "Loss", "Status", "Payable"]}
                rows={processingJobs.map((job) => [
                  job.jobNumber,
                  lotNumber(job.lotId),
                  vendorName(job.vendorId),
                  job.type,
                  formatMeters(job.sentMeters),
                  formatMeters(job.receivedMeters),
                  formatMeters(job.lossMeters),
                  <Badge key={job.id} label={job.status} tone={job.status === "Received" ? "emerald" : "amber"} />,
                  formatPKR(job.status === "Received" ? job.sentMeters * job.ratePerMeter : 0),
                ])}
                empty="No processing jobs yet."
              />
            </Panel>
          </>
        );
      case "Cutting":
        return (
          <TwoColumn
            left={
              <Panel title="Cut Into Suits">
                <form onSubmit={handleCutting} className="grid gap-3">
                  <SelectInput label="Select lot with processed meters" value={cuttingForm.lotId} onChange={(value) => setCuttingForm({ ...cuttingForm, lotId: value })} options={rawLots.filter((lot) => lot.processedMeters > 0).map((lot) => ({ value: lot.id, label: `${lot.lotNumber} - ${formatMeters(lot.processedMeters)} processed` }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput label="Front (m)" value={cuttingForm.frontCuttingMeters} onChange={(value) => setCuttingForm({ ...cuttingForm, frontCuttingMeters: value })} />
                    <NumberInput label="Back (m)" value={cuttingForm.backCuttingMeters} onChange={(value) => setCuttingForm({ ...cuttingForm, backCuttingMeters: value })} />
                  </div>
                  <CalcLine label="Total meter per suit" value={formatMeters(toNumber(cuttingForm.frontCuttingMeters) + toNumber(cuttingForm.backCuttingMeters))} />
                  <TextInput label="Article number" value={cuttingForm.articleNumber} onChange={(value) => setCuttingForm({ ...cuttingForm, articleNumber: value })} placeholder="A-502" />
                  <NumberInput label="Cutting cost optional (PKR)" value={cuttingForm.cuttingCost} onChange={(value) => setCuttingForm({ ...cuttingForm, cuttingCost: value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <CalcLine label="Suits" value={formatSuits(Math.floor((rawLots.find((lot) => lot.id === cuttingForm.lotId)?.processedMeters ?? 0) / Math.max(toNumber(cuttingForm.frontCuttingMeters) + toNumber(cuttingForm.backCuttingMeters), 1)))} />
                    <CalcLine label="Leftover" value={formatMeters((rawLots.find((lot) => lot.id === cuttingForm.lotId)?.processedMeters ?? 0) % Math.max(toNumber(cuttingForm.frontCuttingMeters) + toNumber(cuttingForm.backCuttingMeters), 1))} />
                  </div>
                  <TextArea label="Notes" value={cuttingForm.notes} onChange={(value) => setCuttingForm({ ...cuttingForm, notes: value })} />
                  <PrimaryButton>Cut Into Suits</PrimaryButton>
                </form>
              </Panel>
            }
            right={
              <Panel title="Cutting Jobs">
                <DataTable
                  headers={["Lot", "Article", "Used", "Front", "Back", "Total/Suit", "Suits", "Leftover", "Cutting cost"]}
                  rows={cuttingJobs.map((job) => [
                    lotNumber(job.lotId),
                    job.articleNumber,
                    formatMeters(job.processedMetersUsed),
                    formatMeters(job.frontCuttingMeters),
                    formatMeters(job.backCuttingMeters),
                    formatMeters(job.totalMetersPerSuit),
                    formatSuits(job.suitsCreated),
                    formatMeters(job.leftoverMeters),
                    formatPKR(job.cuttingCost),
                  ])}
                  empty="No cutting jobs yet."
                />
              </Panel>
            }
          />
        );
      case "Embroidery":
        {
          const selectedArticle = finishedArticles.find((article) => article.id === embroiderySendForm.articleId);
          const selectedReceiveJob = embroideryJobs.find((job) => job.id === embroideryReceiveForm.jobId);
          const pendingEmbroideryJobs = embroideryJobs.filter((job) => job.status === "Sent");
          const embroideryAReceived = embroideryJobs.reduce((sum, job) => sum + job.receivedASuits, 0);
          const embroideryVendorPayable = embroideryJobs.reduce(
            (sum, job) => sum + (job.status === "Received" ? job.sentSuits * job.ratePerSuit : 0),
            0,
          );
          const calculatedBCategory = selectedReceiveJob
            ? Math.max(selectedReceiveJob.sentSuits - toNumber(embroideryReceiveForm.receivedSuits), 0)
            : 0;
          const calculatedPayable = selectedReceiveJob ? selectedReceiveJob.sentSuits * selectedReceiveJob.ratePerSuit : 0;

          return (
            <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
              <div className="space-y-5">
                <Panel title="Send to Embroidery" subtitle="Move cut suits from shop stock to embroidery vendor work.">
                  <form onSubmit={handleEmbroiderySend} className="grid gap-3">
                    <SelectInput label="Select article" value={embroiderySendForm.articleId} onChange={(value) => setEmbroiderySendForm({ ...embroiderySendForm, articleId: value })} options={finishedArticles.filter((article) => article.aCategorySuits > 0).map((article) => ({ value: article.id, label: `${article.articleNumber} - ${formatSuits(article.aCategorySuits)} A category` }))} />
                    <CalcLine label="Available A stock" value={formatSuits(selectedArticle?.aCategorySuits ?? 0)} />
                    <TextInput label="Vendor name" value={embroiderySendForm.vendorName} onChange={(value) => setEmbroiderySendForm({ ...embroiderySendForm, vendorName: value })} placeholder="Star Embroidery" />
                    <div className="grid grid-cols-2 gap-2">
                      <NumberInput label="Suits sent" value={embroiderySendForm.suitsSent} onChange={(value) => setEmbroiderySendForm({ ...embroiderySendForm, suitsSent: value })} />
                      <NumberInput label="Rate / suit (PKR)" value={embroiderySendForm.ratePerSuit} onChange={(value) => setEmbroiderySendForm({ ...embroiderySendForm, ratePerSuit: value })} />
                    </div>
                    <TextInput label="Expected return date" type="date" value={embroiderySendForm.expectedReturnDate} onChange={(value) => setEmbroiderySendForm({ ...embroiderySendForm, expectedReturnDate: value })} />
                    <TextArea label="Notes" value={embroiderySendForm.notes} onChange={(value) => setEmbroiderySendForm({ ...embroiderySendForm, notes: value })} />
                    <PrimaryButton>Send to Embroidery</PrimaryButton>
                  </form>
                </Panel>

                <Panel title="Receive Embroidery" subtitle="Receive A Category suits and convert damaged pieces into B Category stock.">
                  <form onSubmit={handleEmbroideryReceive} className="grid gap-3">
                    <SelectInput label="Pending embroidery job" value={embroideryReceiveForm.jobId} onChange={(value) => setEmbroideryReceiveForm({ ...embroideryReceiveForm, jobId: value })} options={pendingEmbroideryJobs.map((job) => ({ value: job.id, label: `${job.jobNumber} - ${articleNumber(job.articleId)} - ${formatSuits(job.sentSuits)}` }))} />
                    <div className="grid grid-cols-2 gap-2">
                      <CalcLine label="Sent suits" value={formatSuits(selectedReceiveJob?.sentSuits ?? 0)} />
                      <CalcLine label="Vendor" value={selectedReceiveJob ? vendorName(selectedReceiveJob.vendorId) : "-"} />
                    </div>
                    <NumberInput label="Received A Category" value={embroideryReceiveForm.receivedSuits} onChange={(value) => setEmbroideryReceiveForm({ ...embroideryReceiveForm, receivedSuits: value })} />
                    <div className="grid grid-cols-2 gap-2">
                      <CalcLine label="B Category sellable" value={formatSuits(calculatedBCategory)} />
                      <CalcLine label="Payable" value={formatPKR(calculatedPayable)} />
                    </div>
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      B Category means damaged but sellable stock.
                    </p>
                    <PrimaryButton>Receive Embroidery</PrimaryButton>
                  </form>
                </Panel>
              </div>

              <div className="space-y-5">
                <Panel title="Embroidery Summary" subtitle="Current embroidery movement and payable position.">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryStat label="Suits with embroidery" value={formatSuits(totals.withEmbroidery)} tone="info" />
                    <SummaryStat label="A Category received" value={formatSuits(embroideryAReceived)} tone="success" />
                    <SummaryStat label="B Category stock" value={formatSuits(totals.readyBStock)} tone="warning" />
                    <SummaryStat label="Vendor payable" value={formatPKR(embroideryVendorPayable)} tone="warning" />
                  </div>
                </Panel>

                <Panel title="Pending Embroidery Jobs" subtitle="Suits currently with embroidery vendors.">
                  <DataTable
                    headers={["Job", "Article", "Vendor", "Sent", "Rate", "Expected"]}
                    rows={pendingEmbroideryJobs.map((job) => [
                      job.jobNumber,
                      articleNumber(job.articleId),
                      vendorName(job.vendorId),
                      formatSuits(job.sentSuits),
                      formatPKR(job.ratePerSuit),
                      job.expectedReturnDate,
                    ])}
                    empty="No pending embroidery jobs."
                  />
                </Panel>

                <Panel title="Embroidery History" subtitle="A Category and B Category received from vendor work.">
                  <DataTable
                    headers={["Job", "Article", "Vendor", "Sent", "A Category", "B Category", "Payable", "Status"]}
                    rows={embroideryJobs.map((job) => [
                      job.jobNumber,
                      articleNumber(job.articleId),
                      vendorName(job.vendorId),
                      formatSuits(job.sentSuits),
                      <Badge key={`${job.id}-a`} label={formatSuits(job.receivedASuits)} tone="emerald" />,
                      <Badge key={`${job.id}-b`} label={formatSuits(job.bCategorySuits)} tone="amber" />,
                      <span key={`${job.id}-payable`} className="font-semibold text-amber-700">{formatPKR(job.status === "Received" ? job.sentSuits * job.ratePerSuit : 0)}</span>,
                      <Badge key={job.id} label={job.status} tone={job.status === "Received" ? "emerald" : "amber"} />,
                    ])}
                    empty="No embroidery history yet."
                  />
                </Panel>
              </div>
            </div>
          );
        }
      case "Finished Stock":
        {
          const highestValueArticle = finishedArticles
            .map((article) => ({
              article,
              value: (article.aCategorySuits + article.bCategorySuits) * article.costPerSuit,
            }))
            .sort((a, b) => b.value - a.value)[0];
          const lowStockArticles = finishedArticles.filter((article) => article.aCategorySuits + article.bCategorySuits === 0);
          const estimatedOnHandProfit = finishedArticles.reduce(
            (sum, article) =>
              sum +
              article.aCategorySuits * (article.aCategorySalePrice - article.costPerSuit) +
              article.bCategorySuits * (article.bCategorySalePrice - article.costPerSuit),
            0,
          );

          return (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <MetricCard label="Total Ready Suits" value={formatSuits(totals.readyStock)} helper="A + B stock" tone="sky" />
                <MetricCard label="A Category Suits" value={formatSuits(totals.readyAStock)} helper="Prime ready maal" tone="emerald" />
                <MetricCard label="B Category Suits" value={formatSuits(totals.readyBStock)} helper="Damaged sellable" tone="amber" />
                <MetricCard label="Ready Stock Value" value={formatPKR(totals.readyStockValue)} helper="At cost value" tone="slate" />
                <MetricCard label="Estimated Profit" value={formatPKR(estimatedOnHandProfit)} helper="If stock sells" tone="emerald" />
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <Panel title="Finished Stock" subtitle="Ready maal control with editable local sale prices and cost per suit.">
                  <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    B Category means damaged but sellable stock.
                  </p>
                  <DataTable
                    headers={["Article", "A Stock", "B Stock", "Cost/Suit", "A Sale Price", "B Sale Price", "A Profit/Suit", "B Profit/Suit", "Stock Value"]}
                    rows={finishedArticles.map((article) => [
                      <span key={`${article.id}-article`} className="font-medium text-slate-950">{article.articleNumber}</span>,
                      <Badge key={`${article.id}-a`} label={formatSuits(article.aCategorySuits)} tone="emerald" />,
                      <Badge key={`${article.id}-b`} label={formatSuits(article.bCategorySuits)} tone="amber" />,
                      <SmallNumber key={`${article.id}-cost`} value={String(article.costPerSuit)} onChange={(value) => updateArticlePrice(article.id, "costPerSuit", value)} />,
                      <SmallNumber key={`${article.id}-ap`} value={String(article.aCategorySalePrice)} onChange={(value) => updateArticlePrice(article.id, "aCategorySalePrice", value)} />,
                      <SmallNumber key={`${article.id}-bp`} value={String(article.bCategorySalePrice)} onChange={(value) => updateArticlePrice(article.id, "bCategorySalePrice", value)} />,
                      formatPKR(article.aCategorySalePrice - article.costPerSuit),
                      formatPKR(article.bCategorySalePrice - article.costPerSuit),
                      formatPKR((article.aCategorySuits + article.bCategorySuits) * article.costPerSuit),
                    ])}
                    empty="No finished stock yet."
                  />
                </Panel>

                <Panel title="Stock Health" subtitle="Quick owner view of ready stock condition.">
                  <div className="divide-y divide-slate-100">
                    <DashboardLine label="Ready for sale" value={formatSuits(totals.readyStock)} tone="success" />
                    <DashboardLine label="B Category quantity" value={formatSuits(totals.readyBStock)} tone="warning" />
                    <DashboardLine label="Highest value article" value={highestValueArticle ? `${highestValueArticle.article.articleNumber} · ${formatPKR(highestValueArticle.value)}` : "-"} tone="success" />
                    <DashboardLine label="Low/empty stock articles" value={String(lowStockArticles.length)} tone={lowStockArticles.length > 0 ? "warning" : "success"} />
                  </div>
                </Panel>
              </div>
            </>
          );
        }
      case "Sales":
        {
          const selectedSaleArticle = finishedArticles.find((article) => article.id === saleForm.articleId);
          const selectedCategoryStock =
            saleForm.category === "A Category"
              ? selectedSaleArticle?.aCategorySuits ?? 0
              : selectedSaleArticle?.bCategorySuits ?? 0;
          const saleTotal = toNumber(saleForm.quantity) * toNumber(saleForm.rate);
          const salePaid = toNumber(saleForm.paidAmount);
          const saleBalance = saleTotal - salePaid;
          const aCategorySold = sales
            .filter((sale) => sale.category === "A Category")
            .reduce((sum, sale) => sum + sale.quantity, 0);
          const bCategorySold = sales
            .filter((sale) => sale.category === "B Category")
            .reduce((sum, sale) => sum + sale.quantity, 0);

          return (
            <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
              <Panel title="Create Sale" subtitle="Daily shop counter sale with cash, credit, or partial payment.">
                <form onSubmit={handleSale} className="grid gap-3">
                  <TextInput label="Customer name" value={saleForm.customerName} onChange={(value) => setSaleForm({ ...saleForm, customerName: value })} placeholder="Ali Fabrics" />
                  <SelectInput label="Select article" value={saleForm.articleId} onChange={(value) => {
                    const article = finishedArticles.find((item) => item.id === value);
                    setSaleForm({
                      ...saleForm,
                      articleId: value,
                      rate: String(
                        saleForm.category === "A Category"
                          ? article?.aCategorySalePrice ?? saleForm.rate
                          : article?.bCategorySalePrice ?? saleForm.rate,
                      ),
                    });
                  }} options={finishedArticles.filter((article) => article.aCategorySuits + article.bCategorySuits > 0).map((article) => ({ value: article.id, label: `${article.articleNumber} - A ${formatSuits(article.aCategorySuits)}, B ${formatSuits(article.bCategorySuits)}` }))} />
                  <SelectInput label="Category" value={saleForm.category} onChange={(value) => {
                    const category = value as Sale["category"];
                    const article = finishedArticles.find((item) => item.id === saleForm.articleId);
                    setSaleForm({
                      ...saleForm,
                      category,
                      rate: String(category === "A Category" ? article?.aCategorySalePrice ?? saleForm.rate : article?.bCategorySalePrice ?? saleForm.rate),
                    });
                  }} options={["A Category", "B Category"].map((value) => ({ value, label: value }))} />
                  <CalcLine label={saleForm.category === "A Category" ? "Available A stock" : "Available B stock"} value={formatSuits(selectedCategoryStock)} />
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput label="Quantity (suits)" value={saleForm.quantity} onChange={(value) => setSaleForm({ ...saleForm, quantity: value })} />
                    <NumberInput label="Rate (PKR)" value={saleForm.rate} onChange={(value) => setSaleForm({ ...saleForm, rate: value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <NumberInput label="Paid amount (PKR)" value={saleForm.paidAmount} onChange={(value) => setSaleForm({ ...saleForm, paidAmount: value })} />
                    <SelectInput label="Payment type" value={saleForm.paymentType} onChange={(value) => setSaleForm({ ...saleForm, paymentType: value as Sale["paymentType"] })} options={["Cash", "Credit", "Partial"].map((value) => ({ value, label: value }))} />
                  </div>
                  <TextArea label="Notes" value={saleForm.notes} onChange={(value) => setSaleForm({ ...saleForm, notes: value })} />
                  <div className="grid grid-cols-3 gap-2">
                    <CalcLine label="Total" value={formatPKR(saleTotal)} />
                    <CalcLine label="Paid" value={formatPKR(salePaid)} />
                    <CalcLine label="Balance" value={formatPKR(saleBalance)} />
                  </div>
                  <Badge label={saleBalance > 0 ? "Customer Credit" : "Paid / Clear"} tone={saleBalance > 0 ? "rose" : "emerald"} />
                  <PrimaryButton>Create Sale</PrimaryButton>
                </form>
              </Panel>

              <div className="space-y-5">
                <Panel title="Sale Summary" subtitle="Current sales and category movement.">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <SummaryStat label="Total sales" value={formatPKR(totals.totalSales)} tone="success" />
                    <SummaryStat label="Amount received" value={formatPKR(totals.totalReceived)} tone="success" />
                    <SummaryStat label="Customer credit" value={formatPKR(totals.customerCredit)} tone="danger" />
                    <SummaryStat label="A category sold" value={formatSuits(aCategorySold)} tone="success" />
                    <SummaryStat label="B category sold" value={formatSuits(bCategorySold)} tone="warning" />
                  </div>
                </Panel>

                <Panel title="Sales History" subtitle="Invoice-style register for cash, credit, and partial sales.">
                  <DataTable
                    headers={["Date", "Customer", "Article", "Category", "Qty", "Rate", "Total", "Paid", "Balance", "Type"]}
                    rows={sales.map((sale) => [
                      sale.date,
                      customerName(sale.customerId),
                      articleNumber(sale.articleId),
                      <Badge key={`${sale.id}-cat`} label={sale.category} tone={sale.category === "A Category" ? "emerald" : "amber"} />,
                      formatSuits(sale.quantity),
                      formatPKR(sale.rate),
                      formatPKR(sale.total),
                      formatPKR(sale.paid),
                      <span key={`${sale.id}-balance`} className={sale.balance > 0 ? "font-semibold text-red-600" : "font-semibold text-green-700"}>{formatPKR(sale.balance)}</span>,
                      sale.paymentType,
                    ])}
                    empty="No sales yet."
                  />
                </Panel>
              </div>
            </div>
          );
        }
      case "Customer Khata":
        {
          const largestBalanceCustomer = [...customerSummaries].sort((a, b) => b.balance - a.balance)[0];
          const selectedCustomer = customers.find((customer) => customer.id === customerPaymentForm.partyId);
          const selectedCustomerBalance = selectedCustomer ? balanceFor(ledgerEntries, selectedCustomer.id) : 0;

          return (
            <>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryStat label="Total customers" value={String(customers.length)} tone="info" />
                <SummaryStat label="Credit pending" value={formatPKR(totals.customerCredit)} tone="danger" />
                <SummaryStat label="Total paid" value={formatPKR(customerSummaries.reduce((sum, item) => sum + item.totalPaid, 0))} tone="success" />
                <SummaryStat label="Largest balance" value={largestBalanceCustomer ? `${largestBalanceCustomer.customer.name} - ${formatPKR(largestBalanceCustomer.balance)}` : "-"} tone={largestBalanceCustomer?.balance > 0 ? "danger" : "success"} />
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                <Panel title="Customer Ledger" subtitle="Credit customer khata with sales, paid amount, and pending balance.">
                  <DataTable
                    headers={["Customer", "Total Sales", "Paid", "Balance", "Last Sale", "Status"]}
                    rows={customerSummaries.map((item) => [
                      item.customer.name,
                      formatPKR(item.totalSales),
                      formatPKR(item.totalPaid),
                      <span key={`${item.customer.id}-balance`} className={item.balance > 0 ? "font-semibold text-red-600" : "font-semibold text-green-700"}>{formatPKR(item.balance)}</span>,
                      item.lastSaleDate,
                      <Badge key={item.customer.id} label={item.balance > 0 ? "Pending" : "Clear"} tone={item.balance > 0 ? "rose" : "emerald"} />,
                    ])}
                    empty="No customers yet."
                  />
                </Panel>

                <Panel title="Add Customer Payment" subtitle="Use this when a credit customer pays later.">
                  <form onSubmit={handleCustomerPayment} className="grid gap-3">
                    <SelectInput label="Select customer" value={customerPaymentForm.partyId} onChange={(value) => setCustomerPaymentForm({ ...customerPaymentForm, partyId: value })} options={customers.map((customer) => ({ value: customer.id, label: `${customer.name} - ${formatPKR(balanceFor(ledgerEntries, customer.id))}` }))} />
                    <CalcLine label="Current balance" value={formatPKR(selectedCustomerBalance)} />
                    <NumberInput label="Payment amount" value={customerPaymentForm.amount} onChange={(value) => setCustomerPaymentForm({ ...customerPaymentForm, amount: value })} />
                    <TextArea label="Note" value={customerPaymentForm.note} onChange={(value) => setCustomerPaymentForm({ ...customerPaymentForm, note: value })} />
                    <PrimaryButton>Add Payment</PrimaryButton>
                  </form>
                </Panel>
              </div>

              <Panel title="Customer Sale History" subtitle="Sale history feeding customer khata balances.">
                <DataTable
                  headers={["Date", "Customer", "Article", "Category", "Total", "Paid", "Balance"]}
                  rows={sales.map((sale) => [
                    sale.date,
                    customerName(sale.customerId),
                    articleNumber(sale.articleId),
                    <Badge key={`${sale.id}-history-cat`} label={sale.category} tone={sale.category === "A Category" ? "emerald" : "amber"} />,
                    formatPKR(sale.total),
                    formatPKR(sale.paid),
                    <span key={`${sale.id}-history-balance`} className={sale.balance > 0 ? "font-semibold text-red-600" : "font-semibold text-green-700"}>{formatPKR(sale.balance)}</span>,
                  ])}
                  empty="No sale history."
                />
              </Panel>
            </>
          );
        }
      case "Supplier / Vendor Khata":
        return (
          <>
            <TwoColumn
              left={
                <Panel title="Supplier / Vendor Khata">
                  <DataTable
                    headers={["Name", "Type", "Total payable", "Paid", "Balance", "Last activity", "Notes"]}
                    rows={payableSummaries.map((item) => [
                      item.name,
                      <Badge key={item.id} label={item.type} tone={item.type === "Supplier" ? "sky" : "amber"} />,
                      formatPKR(item.payable),
                      formatPKR(item.paid),
                      formatPKR(item.balance),
                      item.lastActivity,
                      item.notes,
                    ])}
                    empty="No supplier/vendor khata yet."
                  />
                </Panel>
              }
              right={
                <Panel title="Add Payment">
                  <form onSubmit={handlePayablePayment} className="grid gap-3">
                    <SelectInput label="Select supplier/vendor" value={payablePaymentForm.partyId} onChange={(value) => setPayablePaymentForm({ ...payablePaymentForm, partyId: value })} options={payableSummaries.map((party) => ({ value: party.id, label: `${party.name} (${party.type}) - ${formatPKR(party.balance)}` }))} />
                    <NumberInput label="Payment amount" value={payablePaymentForm.amount} onChange={(value) => setPayablePaymentForm({ ...payablePaymentForm, amount: value })} />
                    <TextArea label="Note" value={payablePaymentForm.note} onChange={(value) => setPayablePaymentForm({ ...payablePaymentForm, note: value })} />
                    <PrimaryButton>Add Payment</PrimaryButton>
                  </form>
                </Panel>
              }
            />
          </>
        );
      case "Reports": {
        const bestArticle = finishedArticles
          .map((article) => ({
            article,
            sold: sales.filter((sale) => sale.articleId === article.id).reduce((sum, sale) => sum + sale.quantity, 0),
          }))
          .sort((a, b) => b.sold - a.sold)[0];
        const topCreditCustomer = [...customerSummaries].sort((a, b) => b.balance - a.balance)[0];
        const biggestPayable = [...payableSummaries].sort((a, b) => b.balance - a.balance)[0];
        return (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total purchases" value={formatPKR(totals.purchases)} tone="slate" />
              <MetricCard label="Raw meters purchased" value={formatMeters(totals.rawMetersPurchased)} tone="sky" />
              <MetricCard label="Processing cost" value={formatPKR(totals.processingCost)} tone="amber" />
              <MetricCard label="Embroidery cost" value={formatPKR(totals.embroideryCost)} tone="violet" />
              <MetricCard label="Total sales" value={formatPKR(totals.totalSales)} tone="emerald" />
              <MetricCard label="Total amount received" value={formatPKR(totals.totalReceived)} tone="emerald" />
              <MetricCard label="Customer credit" value={formatPKR(totals.customerCredit)} tone="rose" />
              <MetricCard label="Supplier payable" value={formatPKR(totals.supplierPayable)} tone="amber" />
              <MetricCard label="Vendor payable" value={formatPKR(totals.vendorPayable)} tone="amber" />
              <MetricCard label="A category stock value" value={formatPKR(totals.aCategoryStockValue)} tone="sky" />
              <MetricCard label="B category stock value" value={formatPKR(totals.bCategoryStockValue)} tone="amber" />
              <MetricCard label="B category quantity" value={formatSuits(totals.bCategoryQuantity)} tone="amber" />
              <MetricCard label="Estimated profit" value={formatPKR(totals.estimatedProfit)} tone="emerald" />
              <MetricCard label="A category sales profit" value={formatPKR(totals.estimatedAProfit)} tone="emerald" />
              <MetricCard label="B category sales profit" value={formatPKR(totals.estimatedBProfit)} tone="amber" />
              <MetricCard label="Processing loss meters" value={formatMeters(totals.processingLoss)} tone="rose" />
              <MetricCard label="Embroidery B category" value={formatSuits(totals.embroideryBCategory)} tone="amber" />
              <MetricCard label="Embroidery missing" value={formatSuits(totals.embroideryMissing)} tone="rose" />
            </div>
            <Panel title="Business Highlights">
              <DataTable
                headers={["Report", "Result", "Value"]}
                rows={[
                  ["Best article by sales", bestArticle?.article.articleNumber ?? "-", bestArticle ? formatSuits(bestArticle.sold) : "-"],
                  ["Top credit customer", topCreditCustomer?.customer.name ?? "-", topCreditCustomer ? formatPKR(topCreditCustomer.balance) : "-"],
                  ["Biggest payable supplier/vendor", biggestPayable?.name ?? "-", biggestPayable ? formatPKR(biggestPayable.balance) : "-"],
                ]}
                empty="No report data."
              />
            </Panel>
            <Panel title="Cutting Report">
              <DataTable
                headers={["Lot", "Article", "Front cutting", "Back cutting", "Total/suit", "Suits created", "Leftover"]}
                rows={cuttingJobs.map((job) => [
                  lotNumber(job.lotId),
                  job.articleNumber,
                  formatMeters(job.frontCuttingMeters),
                  formatMeters(job.backCuttingMeters),
                  formatMeters(job.totalMetersPerSuit),
                  formatSuits(job.suitsCreated),
                  formatMeters(job.leftoverMeters),
                ])}
                empty="No cutting report yet."
              />
            </Panel>
          </>
        );
      }
      default:
        return null;
    }
  }

  function rawLotsTable() {
    return (
      <DataTable
        headers={["Lot", "Supplier", "Cloth", "Purchased", "Raw available", "Processed", "With vendor", "Status", "Notes"]}
        rows={rawLots.map((lot) => {
          const withVendor = processingJobs
            .filter((job) => job.lotId === lot.id && job.status === "Sent")
            .reduce((sum, job) => sum + job.sentMeters, 0);
          const status = getLotStatus(lot, processingJobs, cuttingJobs);
          return [
            lot.lotNumber,
            supplierName(lot.supplierId),
            lot.clothType,
            formatMeters(lot.purchasedMeters),
            formatMeters(lot.rawAvailableMeters),
            formatMeters(lot.processedMeters),
            formatMeters(withVendor),
            <Badge key={lot.id} label={status} tone={status === "In Shop" || status === "Ready for Cutting" ? "emerald" : status === "Cut Into Suits" ? "sky" : "amber"} />,
            lot.notes,
          ];
        })}
        empty="No raw lots yet."
      />
    );
  }
}

function DashboardHero({
  readyStock,
  customerCredit,
  vendorPayable,
}: {
  readyStock: string;
  customerCredit: string;
  vendorPayable: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm shadow-slate-200/60">
      <div className="h-1 bg-[#0f766e]" />
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-teal-100 bg-[#eefdf8] px-2.5 py-1 text-[11px] font-medium text-[#0f766e]">
            Live textile workflow
          </span>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-[#111827]">
            Track every lot from kora kapra to khata.
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-[#64748b]">
            Monitor meters, processing vendors, cutting, embroidery, A/B stock, sales, credit, and payables.
          </p>
          <p className="mt-1.5 text-xs font-medium text-slate-500">Live view of stock, vendor work, customer credit, and pending payments.</p>
        </div>
        <div className="grid min-w-[360px] gap-2 sm:grid-cols-3">
          <MiniStat label="Ready stock" value={readyStock} tone="success" />
          <MiniStat label="Customer credit" value={customerCredit} tone="danger" />
          <MiniStat label="Vendor payable" value={vendorPayable} tone="warning" />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "danger" }) {
  const tones = {
    success: "text-[#16a34a]",
    warning: "text-[#d97706]",
    danger: "text-[#dc2626]",
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className={classNames("mt-0.5 truncate text-sm font-semibold", tones[tone])}>{value}</p>
    </div>
  );
}

function WorkflowJourney() {
  const steps = [
    "Kora Purchase",
    "Dyeing/Printing",
    "Cutting",
    "Embroidery",
    "Finished Stock",
    "Sale",
    "Khata",
  ];
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-2.5">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#111827]">Textile Workflow</h3>
          <p className="text-xs text-[#64748b]">Kora kapra moves from meters to suits, then into khata.</p>
        </div>
      </div>
      <div className="grid gap-1 lg:grid-cols-7">
        {steps.map((step, index) => (
          <div key={step} className="relative rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 after:absolute after:left-full after:top-1/2 after:hidden after:h-px after:w-1 after:bg-slate-200 lg:after:block last:after:hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-slate-400">0{index + 1}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]" />
            </div>
            <p className="mt-0.5 truncate text-[11px] font-medium text-slate-800">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FocusItem({
  label,
  value,
  badge,
  tone = "emerald",
}: {
  label: string;
  value: string;
  badge?: string;
  tone?: "emerald" | "amber" | "rose";
}) {
  const dotTone = tone === "rose" ? "bg-[#dc2626]" : tone === "amber" ? "bg-[#d97706]" : "bg-[#16a34a]";
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex items-start gap-2">
        <span className={classNames("mt-1.5 h-2 w-2 shrink-0 rounded-full", dotTone)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
          {badge ? <div className="mt-2"><Badge label={badge} tone={tone} /></div> : null}
        </div>
      </div>
    </div>
  );
}

function DashboardLine({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "danger" }) {
  const tones = {
    success: "text-[#16a34a]",
    warning: "text-[#d97706]",
    danger: "text-[#dc2626]",
  };
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={classNames("text-right text-sm font-semibold tabular-nums", tones[tone])}>{value}</span>
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "info" | "danger" }) {
  const tones = {
    success: "text-[#16a34a]",
    warning: "text-[#d97706]",
    info: "text-[#2563eb]",
    danger: "text-[#dc2626]",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className={classNames("mt-1 text-sm font-semibold", tones[tone])}>{value}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-950">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs leading-5 text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="p-3.5">{children}</div>
    </section>
  );
}

function TwoColumn({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">{left}{right}</div>;
}

function MetricCard({
  label,
  value,
  helper,
  tone,
  compact = false,
}: {
  label: string;
  value: string;
  helper?: string;
  tone: "emerald" | "amber" | "sky" | "rose" | "violet" | "slate";
  compact?: boolean;
}) {
  const tones = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    sky: "bg-teal-500",
    rose: "bg-rose-600",
    violet: "bg-indigo-500",
    slate: "bg-slate-500",
  };
  const borderTones = {
    emerald: "border-t-emerald-500",
    amber: "border-t-amber-500",
    sky: "border-t-teal-500",
    rose: "border-t-rose-600",
    violet: "border-t-indigo-500",
    slate: "border-t-slate-500",
  };
  const textTones = {
    emerald: "text-green-700",
    amber: "text-amber-700",
    sky: "text-teal-700",
    rose: "text-rose-700",
    violet: "text-indigo-700",
    slate: "text-slate-900",
  };
  return (
    <div className={classNames(compact ? "min-h-[78px]" : "min-h-[96px]", "rounded-xl border border-gray-200 border-t-2 bg-white p-2.5", borderTones[tone])}>
      <div className="mb-1 flex items-start gap-2">
        <div className={classNames("h-1.5 w-1.5 rounded-full", tones[tone])} />
        <p className={classNames(compact ? "min-h-0" : "min-h-[24px]", "text-[10px] font-medium uppercase leading-3 tracking-[0.08em] text-gray-500")}>{label}</p>
      </div>
      <p className={classNames(compact ? "text-lg" : "text-xl", "font-semibold leading-6 tracking-tight", textTones[tone])}>{value}</p>
      {helper ? <p className="mt-0.5 truncate text-[11px] text-gray-500">{helper}</p> : null}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: "emerald" | "amber" | "rose" | "sky" }) {
  const tones = {
    emerald: "border-green-200 bg-green-50 text-green-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    sky: "border-teal-200 bg-teal-50 text-teal-700",
  };
  return <span className={classNames("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", tones[tone])}>{label}</span>;
}

function DataTable({ headers, rows, empty }: { headers: string[]; rows: React.ReactNode[][]; empty: string }) {
  const numericHeaders = new Set([
    "Purchased",
    "Raw available",
    "Processed",
    "With vendor",
    "Sent",
    "Received",
    "Loss",
    "Payable",
    "Used",
    "Meters used",
    "Front",
    "Back",
    "Total/suit",
    "Total/Suit",
    "Suits",
    "Leftover",
    "Cutting cost",
    "Qty",
    "Rate",
    "Total",
    "Paid",
    "Balance",
    "Quantity",
    "A category received",
    "B category",
    "Missing",
    "Value",
    "A Stock",
    "B Stock",
    "A Price",
    "B Price",
    "Cost",
    "A Profit",
    "B Profit",
  ]);
  return (
    <div className="thin-scrollbar overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead className="bg-gray-50 text-[10px] uppercase tracking-[0.08em] text-gray-500">
          <tr>
            {headers.map((header) => {
              const isNumeric = numericHeaders.has(header);
              return (
                <th key={header} className={classNames("whitespace-nowrap px-3 py-2.5 font-semibold", isNumeric && "text-right")}>
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-xs font-medium text-gray-500" colSpan={headers.length}>{empty}</td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="align-top transition hover:bg-gray-50">
                {row.map((cell, cellIndex) => {
                  const isNumeric = numericHeaders.has(headers[cellIndex]);
                  return (
                    <td key={`cell-${cellIndex}`} className={classNames("whitespace-nowrap px-3 py-2.5 font-normal text-gray-700", isNumeric && "text-right tabular-nums")}>
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="grid gap-1 text-[13px] font-medium text-gray-700">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
      />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <TextInput label={label} type="number" value={value} onChange={onChange} />;
}

function SmallNumber({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-24 rounded-lg border border-gray-300 bg-white px-2 text-sm font-normal text-gray-900 outline-none focus:border-teal-700"
    />
  );
}

function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="grid gap-1 text-[13px] font-medium text-gray-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-[13px] font-medium text-gray-700">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10"
      />
    </label>
  );
}

function CalcLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
      <span className="font-medium text-gray-500">{label}</span>
      <span className="text-right font-semibold tabular-nums text-gray-900">{value}</span>
    </div>
  );
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="h-10 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-700/25"
    >
      {children}
    </button>
  );
}
