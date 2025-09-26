import { User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { getCurrentDate } from "../lib/date-utils";

// const formatted = new Intl.DateTimeFormat("en-US", {
//   year: "numeric",
//   month: "long",
//   day: "numeric",
// }).format(new Date());

export default function HeadcountCard() {
  return (

    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-300 border-b">
        <CardTitle className="text-lg font-sans text-white">Headcount <br /> {getCurrentDate()}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold mb-6">
            {/* <p className="text-blue-600">{getCurrentDate()}</p> */}
          </div>

          <div className="flex justify-center gap-16 w-full">
            {/* Male stats */}
            <div className="flex flex-col items-center">
              <div className="text-[#3BB4E5] text-3xl font-semibold mb-2">533</div>
              <div className="relative mb-2">
                <User size={48} className="text-[#3BB4E5] fill-[#3BB4E5]" />
              </div>
              <div className="text-[#3BB4E5] text-xl font-semibold">57.4%</div>
            </div>

            {/* Female stats */}
            <div className="flex flex-col items-center">
              <div className="text-[#E83E8C] text-3xl font-semibold mb-2">415</div>
              <div className="relative mb-2">
                <User size={48} className="text-[#E83E8C] fill-[#E83E8C]" />
              </div>
              <div className="text-[#E83E8C] text-xl font-semibold">45.8%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
