"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Slider,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Divider,
} from "@mui/material";

interface HomeFinanceCalculatorProps {
  propertyPrice: number; // in PKR
  propertyId: number; // for the loan application
  onApplyLoan: () => void;
}

const MIN_LOAN_PERIOD = 3;
const MAX_LOAN_PERIOD = 25;
const MIN_DOWN_PAYMENT_PERCENT = 30;
const MAX_DOWN_PAYMENT_PERCENT = 70;
const INTEREST_RATE_PERCENT = 16.75; // Kibor + 3 (approx)

export default function HomeFinanceCalculator({
  propertyPrice,
  propertyId,
  onApplyLoan,
}: HomeFinanceCalculatorProps) {
  const [loanPeriod, setLoanPeriod] = useState<number>(25);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [interestRate] = useState<number>(INTEREST_RATE_PERCENT);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [bankFinance, setBankFinance] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);

  useEffect(() => {
    const downPayment = (downPaymentPercent / 100) * propertyPrice;
    const principal = propertyPrice - downPayment;
    setBankFinance(principal);

    const monthlyRate = interestRate / 100 / 12;
    const months = loanPeriod * 12;
    let payment = 0;

    if (monthlyRate === 0) {
      payment = principal / months;
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      payment = (principal * monthlyRate * factor) / (factor - 1);
    }
    setMonthlyPayment(payment);

    const totalPay = payment * months;
    setTotalPayment(totalPay);
    setTotalInterest(totalPay - principal);
  }, [propertyPrice, loanPeriod, downPaymentPercent, interestRate]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatShort = (value: number) => {
    if (value >= 1e7) return `${(value / 1e7).toFixed(2)} Crore`;
    if (value >= 1e5) return `${(value / 1e5).toFixed(2)} Lakh`;
    return formatCurrency(value);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        Home Finance
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Calculate and view the monthly mortgage on this house
      </Typography>

      <Grid container spacing={4}>
        {/* Left side – inputs */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* Property Price (display only) */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Property Price
            </Typography>
            <TextField
              fullWidth
              value={propertyPrice.toLocaleString()}
              disabled
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">PKR</InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Loan Period */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Loan Period (Years)
            </Typography>
            <Slider
              value={loanPeriod}
              onChange={(_, val) => setLoanPeriod(val as number)}
              min={MIN_LOAN_PERIOD}
              max={MAX_LOAN_PERIOD}
              step={1}
              valueLabelDisplay="auto"
              aria-label="Loan period"
            />
            <TextField
              type="number"
              value={loanPeriod}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= MIN_LOAN_PERIOD && v <= MAX_LOAN_PERIOD)
                  setLoanPeriod(v);
              }}
              size="small"
              sx={{ width: 100 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">Years</InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Down Payment */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Down Payment (%)
            </Typography>
            <Slider
              value={downPaymentPercent}
              onChange={(_, val) => setDownPaymentPercent(val as number)}
              min={MIN_DOWN_PAYMENT_PERCENT}
              max={MAX_DOWN_PAYMENT_PERCENT}
              step={1}
              valueLabelDisplay="auto"
              aria-label="Down payment percent"
            />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                type="number"
                value={downPaymentPercent}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (
                    v >= MIN_DOWN_PAYMENT_PERCENT &&
                    v <= MAX_DOWN_PAYMENT_PERCENT
                  )
                    setDownPaymentPercent(v);
                }}
                size="small"
                sx={{ width: 80 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                = {formatShort((downPaymentPercent / 100) * propertyPrice)}
              </Typography>
            </Box>
          </Box>

          {/* Interest Rate (display only) */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Interest Rate
            </Typography>
            <TextField
              value="Kibor + 3"
              disabled
              size="small"
              sx={{ width: 120 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              (16.75% p.a. assumed)
            </Typography>
          </Box>
        </Grid>

        {/* Right side – results */}
        <Grid
          size={{ xs: 12, md: 5 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Monthly Payment
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {formatShort(monthlyPayment)}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" color="text.secondary">
              Bank Finance Amount
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {formatShort(bankFinance)}
            </Typography>

            {/* Payment Breakdown */}
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                Payment Breakdown
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  height: 10,
                  borderRadius: 5,
                  overflow: "hidden",
                  bgcolor: "grey.300",
                }}
              >
                <Box
                  sx={{
                    width: `${
                      totalPayment > 0
                        ? (totalInterest / totalPayment) * 100
                        : 0
                    }%`,
                    bgcolor: "error.main",
                  }}
                />
                <Box
                  sx={{
                    width: `${
                      totalPayment > 0 ? (bankFinance / totalPayment) * 100 : 0
                    }%`,
                    bgcolor: "success.main",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 0.5,
                }}
              >
                <Typography variant="caption" color="error">
                  Interest
                </Typography>
                <Typography variant="caption" color="success.main">
                  Principal
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              onClick={onApplyLoan}
            >
              Apply for Loan
            </Button>
          </Paper>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, textAlign: "center" }}
          >
            DISCLAIMER: Interest rates may vary. Actual rate will be applicable
            as per bank’s policy at the time of application.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
