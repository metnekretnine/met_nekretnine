import { EPotpisCreate } from "@/components/EPotpisCreate/EPotpisCreate";
import { testContractInput } from "@/lib/epotpis/test-data";


export default function Page() {
  const testSamples = { single: testContractInput(false), joint: testContractInput(true) };
  return <EPotpisCreate testSamples={testSamples} />;
}
