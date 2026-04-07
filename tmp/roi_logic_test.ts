import { calculateROI, GATEWAYS } from "../src/lib/roi-engine";
import { PLATFORM_DEFAULTS } from "../src/lib/platforms";

function testCalculator() {
  const price = 97;
  const students = 50;
  const revenue = price * students; // 4850

  console.log(`Test Scenario: $${price} course, ${students} students. Total Revenue: $${revenue}`);

  // Teachable Logic: 5% + Stripe (2.9% + $0.30)
  const teachable = PLATFORM_DEFAULTS.teachable;
  const tResult = calculateROI(revenue, students, teachable.tier, GATEWAYS.stripe);
  
  // Manual check:
  // Platform fee (5%): 4850 * 0.05 = 242.5
  // Stripe fee (2.9%): 4850 * 0.029 = 140.65
  // Stripe fixed (0.3*50): 15
  // Total Fees: 242.5 + 140.65 + 15 + Subscription(59) = 457.15
  
  console.log("\n--- Teachable ---");
  console.log(`Expected Monthly Cost (Manual): ~$457.15`);
  console.log(`Actual Monthly Cost (Engine): $${tResult.monthlyTotalCost.toFixed(2)}`);
  
  // Kajabi Logic: 0% + Monthly
  const kajabi = PLATFORM_DEFAULTS.kajabi;
  const kResult = calculateROI(revenue, students, kajabi.tier, GATEWAYS.stripe);
  
  // Manual check:
  // Platform fee (0%): 0
  // Stripe fee (2.9%): 140.65
  // Stripe fixed: 15
  // Total Fees: 0 + 140.65 + 15 + Subscription(149) = 304.65
  
  console.log("\n--- Kajabi ---");
  console.log(`Expected Monthly Cost (Manual): ~$304.65`);
  console.log(`Actual Monthly Cost (Engine): $${kResult.monthlyTotalCost.toFixed(2)}`);

  const monthlySavings = tResult.monthlyTotalCost - kResult.monthlyTotalCost;
  console.log(`\nWinner: Kajabi saves $${monthlySavings.toFixed(2)}/mo ($${(monthlySavings * 12).toFixed(2)}/yr)`);
}

testCalculator();
