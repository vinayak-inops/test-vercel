import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from  "@repo/ui/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from  "@repo/ui/components/ui/card"
import { Progress } from  "@repo/ui/components/ui/progress"
import { ChevronRight,UserPlus,UserMinus,Cake,Glasses } from "lucide-react"

export default function DashboardInterface() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* Chat Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Chat</CardTitle>
          <button className="opacity-70 hover:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="bg-cyan-500 text-white px-3 py-2 rounded-2xl max-w-[80%]">
                <p className="text-sm">Hey M. hope you are well.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="bg-cyan-500 text-white px-3 py-2 rounded-2xl max-w-[80%]">
                <p className="text-sm">Our idea is accepted by the board. Now it's time to execute it</p>
              </div>
            </div>

            <div className="flex items-start justify-end">
              <div className="bg-rose-500 text-white px-3 py-2 rounded-2xl max-w-[80%]">
                <p className="text-sm">We did it! 😊</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="bg-cyan-500 text-white px-3 py-2 rounded-2xl max-w-[80%]">
                <p className="text-sm">That's really good!</p>
              </div>
            </div>

            <div className="flex items-start justify-end">
              <div className="bg-rose-500 text-white px-3 py-2 rounded-2xl max-w-[80%]">
                <p className="text-sm">But it's important to ship MVP ASAP</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="bg-cyan-500 text-white px-3 py-2 rounded-2xl max-w-[80%]">
                <p className="text-sm">I'll be looking at the process then, just to be sure 😊</p>
              </div>
            </div>

            <div className="flex items-start justify-end">
              <div className="bg-rose-500 text-white px-3 py-2 rounded-2xl max-w-[80%]">
                <p className="text-sm">That's awesome. Thanks!</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 border-t pt-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Write your message (Hint: 'PrimeReact')"
              className="flex-1 border-none text-sm focus:outline-none"
            />
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Activity</CardTitle>
          <button className="opacity-70 hover:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Income</span>
                <span className="text-xs text-muted-foreground">30 November, 16:20</span>
              </div>
              <Progress value={65} className="h-2 bg-gray-200"  />
              {/* indicatorClassName="bg-amber-400" */}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Tax</span>
                <span className="text-xs text-muted-foreground">1 December, 15:27</span>
              </div>
              <Progress value={45} className="h-2 bg-gray-200"  />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Invoices</span>
                <span className="text-xs text-muted-foreground">1 December, 15:28</span>
              </div>
              <Progress value={70} className="h-2 bg-gray-200"  />
              {/* indicatorClassName="bg-cyan-500" */}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Expenses</span>
                <span className="text-xs text-muted-foreground">3 December, 09:15</span>
              </div>
              <Progress value={55} className="h-2 bg-gray-200"  />
              {/* indicatorClassName="bg-cyan-500" */}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Bonus</span>
                <span className="text-xs text-muted-foreground">1 December, 23:55</span>
              </div>
              <Progress value={60} className="h-2 bg-gray-200"  />
              {/* indicatorClassName="bg-cyan-500" */}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Revenue</span>
                <span className="text-xs text-muted-foreground">30 November, 16:20</span>
              </div>
              <Progress value={80} className="h-2 bg-gray-200"  />
              {/* indicatorClassName="bg-rose-500" */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Sellers Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Best Sellers</CardTitle>
          <button className="opacity-70 hover:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[
              { name: "New joinees list", icons: UserPlus},
              { name: "Left employees list", icons: UserMinus },
              { name: "Birthday list", icons: Cake },
              { name: "Retirement list", icons: Glasses },
             
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <item.icons className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
