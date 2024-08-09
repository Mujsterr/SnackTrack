import { auth } from "@/firebase";
import { Box, Button, AppBar, Toolbar, Typography } from "@mui/material";
import { signOut } from "firebase/auth";

export default function Header({ loggedIn }) {
	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar
				sx={{ backgroundColor: "#ADD8E6", color: "black" }}
				position="sticky"
			>
				<Toolbar>
					<Typography
						variant="h6"
						sx={{
							fontWeight: "bold",
							color: "#FFF",
							marginRight: "auto",
							fontSize: "1.25rem",
							letterSpacing: "0.05em",
							paddingRight: "20px",
							textTransform: "uppercase",
						}}
					>
						Snack-Track
					</Typography>
					{loggedIn && (
						<Button
							onClick={() => {
								signOut(auth);
							}}
							sx={{
								color: "#FFF",
								marginLeft: "auto",
								fontSize: "1.2rem",
							}}
						>
							Log out
						</Button>
					)}
				</Toolbar>
			</AppBar>
		</Box>
	);
}
