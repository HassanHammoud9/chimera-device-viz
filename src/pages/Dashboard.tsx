import { motion } from "framer-motion";
import { Activity, Cpu, Wifi } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
	{ t: "09:00", load: 22 },
	{ t: "10:00", load: 35 },
	{ t: "11:00", load: 29 },
	{ t: "12:00", load: 41 },
	{ t: "13:00", load: 33 },
	{ t: "14:00", load: 48 },
];

const Card = ({ children }: { children: React.ReactNode }) => (
	<motion.div
		initial={{ opacity: 0, y: 10 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.4 }}
		className="cardish p-4"
	>
		{children}
	</motion.div>
);

export default function Dashboard() {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<Card>
					<div className="flex items-center gap-3">
						<Cpu className="opacity-80" />
						<div>
							<div className="text-sm text-muted">Active Devices</div>
							<div className="text-2xl font-semibold">128</div>
						</div>
					</div>
				</Card>

				<Card>
					<div className="flex items-center gap-3">
						<Wifi className="opacity-80" />
						<div>
							<div className="text-sm text-muted">Online</div>
							<div className="text-2xl font-semibold">117</div>
						</div>
					</div>
				</Card>

				<Card>
					<div className="flex items-center gap-3">
						<Activity className="opacity-80" />
						<div>
							<div className="text-sm text-muted">Avg Load</div>
							<div className="text-2xl font-semibold">48%</div>
						</div>
					</div>
				</Card>
			</div>

			<Card>
				<div className="mb-2 text-sm text-muted">Cluster Load (today)</div>
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={data}>
							<XAxis dataKey="t" stroke="currentColor" />
							<YAxis stroke="currentColor" />
							<Tooltip
								contentStyle={{
									background: "#111826",
									border: "1px solid rgba(255,255,255,.1)",
								}}
							/>
							<Line
								type="monotone"
								dataKey="load"
								stroke="currentColor"
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</Card>
		</div>
	);
}
