import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

// Importing shadcn/ui components (assuming they are available)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// -------------------
// Zod schemas and types
// -------------------
const incomeExpenseSchema = z.object({
  income: z.number().min(0, { message: "Income must be 0 or more" }),
  expenses: z.number().min(0, { message: "Expenses must be 0 or more" }),
});
type IncomeExpenseFormValues = z.infer<typeof incomeExpenseSchema>;

const loanSchema = z.object({
  loanAmount: z.number().min(0, { message: "Loan amount must be 0 or more" }),
  interestRate: z.number().min(0, { message: "Interest rate must be 0 or more" }),
  loanTerm: z.number().min(1, { message: "Loan term must be at least 1 month" }),
});
type LoanFormValues = z.infer<typeof loanSchema>;

const savingsSchema = z.object({
  monthlyContribution: z.number().min(0, {
    message: "Monthly contribution must be 0 or more",
  }),
  interestRate: z.number().min(0, { message: "Interest rate must be 0 or more" }),
  investmentDuration: z.number().min(1, {
    message: "Investment duration must be at least 1 month",
  }),
});
type SavingsFormValues = z.infer<typeof savingsSchema>;

// Currency formatter for result displays
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// -------------------
// Header Component
// -------------------
const Header: React.FC = () => (
  <header className="bg-white shadow fixed top-0 left-0 w-full z-10">
    <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-[#333333]">Personal Finance Calculator</h1>
      {/* Additional navigation links could be added here if needed */}
    </div>
  </header>
);

// -------------------
// Footer Component
// -------------------
const Footer: React.FC = () => (
  <footer className="bg-gray-100 mt-8 py-4">
    <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[#333333]">
      <p>© {new Date().getFullYear()} Personal Finance Calculator. All rights reserved.</p>
      <div className="mt-2 flex justify-center space-x-4">
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
        <a href="/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </a>
      </div>
    </div>
  </footer>
);

// -------------------
// Income & Expense Calculator Component
// -------------------
interface IncomeExpenseProps {
  resetSignal: number;
}

const IncomeExpenseCalculator: React.FC<IncomeExpenseProps> = ({ resetSignal }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IncomeExpenseFormValues>({
    resolver: zodResolver(incomeExpenseSchema),
    defaultValues: { income: 0, expenses: 0 },
  });

  const [netSavings, setNetSavings] = useState<number | null>(null);

  const onSubmit = (data: IncomeExpenseFormValues) => {
    setNetSavings(data.income - data.expenses);
  };

  // Reset form and result on external reset signal change
  useEffect(() => {
    reset();
    setNetSavings(null);
  }, [resetSignal, reset]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow rounded">
        <CardHeader>
          <CardTitle className="text-2xl text-[#333333] font-bold">Income &amp; Expense Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#333333]">
                Monthly Income
              </label>
              <input
                type="number"
                step="any"
                {...register("income", { valueAsNumber: true })}
                className="w-full h-11 rounded border border-[#CCCCCC] bg-[#F5F5F5] px-3 focus:outline-none focus:border-[#4A90E2]"
              />
              {errors.income && (
                <p className="text-red-500 text-sm mt-1">{errors.income.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#333333]">
                Monthly Expenses
              </label>
              <input
                type="number"
                step="any"
                {...register("expenses", { valueAsNumber: true })}
                className="w-full h-11 rounded border border-[#CCCCCC] bg-[#F5F5F5] px-3 focus:outline-none focus:border-[#4A90E2]"
              />
              {errors.expenses && (
                <p className="text-red-500 text-sm mt-1">{errors.expenses.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#4A90E2] text-white rounded hover:scale-105 transition-transform"
            >
              Calculate
            </Button>
          </form>
          {netSavings !== null && (
            <div className="mt-4 p-4 bg-[#F5F5F5] rounded">
              <p className="text-lg font-semibold text-[#333333]">
                Net Savings: {currencyFormatter.format(netSavings)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// -------------------
// Loan Repayment Calculator Component
// -------------------
interface LoanCalculatorProps {
  resetSignal: number;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({ resetSignal }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: { loanAmount: 0, interestRate: 0, loanTerm: 12 },
  });

  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
  } | null>(null);

  const onSubmit = (data: LoanFormValues) => {
    const { loanAmount, interestRate, loanTerm } = data;
    const monthlyRate = (interestRate / 100) / 12;
    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / loanTerm;
    } else {
      const factor = Math.pow(1 + monthlyRate, loanTerm);
      monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
    }
    const totalPayment = monthlyPayment * loanTerm;
    setResult({ monthlyPayment, totalPayment });
  };

  // Reset form and result on external reset signal change
  useEffect(() => {
    reset();
    setResult(null);
  }, [resetSignal, reset]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow rounded">
        <CardHeader>
          <CardTitle className="text-2xl text-[#333333] font-bold">Loan Repayment Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#333333]">
                Loan Amount
              </label>
              <input
                type="number"
                step="any"
                {...register("loanAmount", { valueAsNumber: true })}
                className="w-full h-11 rounded border border-[#CCCCCC] bg-[#F5F5F5] px-3 focus:outline-none focus:border-[#4A90E2]"
              />
              {errors.loanAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.loanAmount.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#333333]">
                Interest Rate (% per year)
              </label>
              <input
                type="number"
                step="any"
                {...register("interestRate", { valueAsNumber: true })}
                className="w-full h-11 rounded border border-[#CCCCCC] bg-[#F5F5F5] px-3 focus:outline-none focus:border-[#4A90E2]"
              />
              {errors.interestRate && (
                <p className="text-red-500 text-sm mt-1">{errors.interestRate.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#333333]">
                Loan Term (months)
              </label>
              <input
                type="number"
                {...register("loanTerm", { valueAsNumber: true })}
                className="w-full h-11 rounded border border-[#CCCCCC] bg-[#F5F5F5] px-3 focus:outline-none focus:border-[#4A90E2]"
              />
              {errors.loanTerm && (
                <p className="text-red-500 text-sm mt-1">{errors.loanTerm.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#4A90E2] text-white rounded hover:scale-105 transition-transform"
            >
              Calculate
            </Button>
          </form>
          {result !== null && (
            <div className="mt-4 p-4 bg-[#F5F5F5] rounded space-y-2">
              <p className="text-lg font-semibold text-[#333333]">
                Monthly Payment: {currencyFormatter.format(result.monthlyPayment)}
              </p>
              <p className="text-lg font-semibold text-[#333333]">
                Total Payment: {currencyFormatter.format(result.totalPayment)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// -------------------
// Savings Projection Calculator Component
// -------------------
interface SavingsProjectionProps {
  resetSignal: number;
}

const SavingsProjectionCalculator: React.FC<SavingsProjectionProps> = ({ resetSignal }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SavingsFormValues>({
    resolver: zodResolver(savingsSchema),
    defaultValues: { monthlyContribution: 0, interestRate: 0, investmentDuration: 12 },
  });

  const [projectedSavings, setProjectedSavings] = useState<number | null>(null);

  const onSubmit = (data: SavingsFormValues) => {
    const { monthlyContribution, interestRate, investmentDuration } = data;
    const monthlyRate = (interestRate / 100) / 12;
    let futureValue = 0;
    if (monthlyRate === 0) {
      futureValue = monthlyContribution * investmentDuration;
    } else {
      futureValue =
        monthlyContribution *
        ((Math.pow(1 + monthlyRate, investmentDuration) - 1) / monthlyRate);
    }
    setProjectedSavings(futureValue);
  };

  // Reset form and result on external reset signal change
  useEffect(() => {
    reset();
    setProjectedSavings(null);
  }, [resetSignal, reset]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow rounded">
        <CardHeader>
          <CardTitle className="text-2xl text-[#333333] font-bold">Savings Projection Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#333333]">
                Monthly Contribution
              </label>
              <input
                type="number"
                step="any"
                {...register("monthlyContribution", { valueAsNumber: true })}
                className="w-full h-11 rounded border border-[#CCCCCC] bg-[#F5F5F5] px-3 focus:outline-none focus:border-[#4A90E2]"
              />
              {errors.monthlyContribution && (
                <p className="text-red-500 text-sm mt-1">{errors.monthlyContribution.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#333333]">
                Interest Rate (% per year)
              </label>
              <input
                type="number"
                step="any"
                {...register("interestRate", { valueAsNumber: true })}
                className="w-full h-11 rounded border border-[#CCCCCC] bg-[#F5F5F5] px-3 focus:outline-none focus:border-[#4A90E2]"
              />
              {errors.interestRate && (
                <p className="text-red-500 text-sm mt-1">{errors.interestRate.message}</p>
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-[#333333]">
                Investment Duration (months)
              </label>
              <input
                type="number"
                {...register("investmentDuration", { valueAsNumber: true })}
                className="w-full h-11 rounded border border-[#CCCCCC] bg-[#F5F5F5] px-3 focus:outline-none focus:border-[#4A90E2]"
              />
              {errors.investmentDuration && (
                <p className="text-red-500 text-sm mt-1">{errors.investmentDuration.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#4A90E2] text-white rounded hover:scale-105 transition-transform"
            >
              Project
            </Button>
          </form>
          {projectedSavings !== null && (
            <div className="mt-4 p-4 bg-[#F5F5F5] rounded">
              <p className="text-lg font-semibold text-[#333333]">
                Projected Savings Value: {currencyFormatter.format(projectedSavings)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// -------------------
// Home Page Component
// -------------------
const Home: React.FC = () => {
  // Reset signal to trigger resetting forms in child components
  const [resetSignal, setResetSignal] = useState<number>(0);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleResetAll = () => {
    setResetSignal((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Grid layout for calculators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <IncomeExpenseCalculator resetSignal={resetSignal} />
          <LoanCalculator resetSignal={resetSignal} />
          <SavingsProjectionCalculator resetSignal={resetSignal} />
        </div>
        {/* Reset All button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleResetAll}
            className="bg-white border border-[#E53935] text-[#E53935] rounded h-11 w-full sm:w-[200px] flex items-center justify-center hover:scale-105 transition-transform"
          >
            <AlertTriangle size={18} className="mr-2" />
            Reset All
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;