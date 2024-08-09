"use client";

import { useEffect, useState } from "react";
import {
	TextField,
	Button,
	Container,
	Typography,
	Paper,
	Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Header from "../Header";
import {
	useCreateUserWithEmailAndPassword,
	useAuthState,
} from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";

const StyledPaper = styled(Paper)(({ theme }) => ({
	padding: theme.spacing(4),
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	backgroundColor: "rgba(255, 255, 255, 0.8)",
	borderRadius: "8px",
	boxShadow: theme.shadows[5],
}));

const CenteredContainer = styled(Container)(() => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	minHeight: "90vh",
}));

const SignUp = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [user, loading] = useAuthState(auth);
	const [createUserWithEmailAndPassword] =
		useCreateUserWithEmailAndPassword(auth);

	const router = useRouter();

	useEffect(() => {
		if (user) {
			return router.push("/");
		}
	}, [user, router]);

	const handleSignUp = async (e) => {
		e.preventDefault();
		try {
			await createUserWithEmailAndPassword(email, password);
			setEmail("");
			setPassword("");
			return router.push("/");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<Header loggedIn={false} />
			{loading ? (
				<CenteredContainer>Loading...</CenteredContainer>
			) : (
				<CenteredContainer component="main" maxWidth="xs">
					<StyledPaper>
						<Typography component="h1" variant="h5">
							Sign Up
						</Typography>
						<Box
							component="form"
							onSubmit={handleSignUp}
							sx={{ mt: 1 }}
						>
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								id="email"
								label="Email Address"
								name="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								name="password"
								label="Password"
								type="password"
								id="password"
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								sx={{ mt: 3, mb: 2 }}
							>
								Sign Up
							</Button>
							<Typography>
								Already have an account?{" "}
								<a href="/sign-in">Sign In</a>
							</Typography>
						</Box>
					</StyledPaper>
				</CenteredContainer>
			)}
		</>
	);
};

export default SignUp;
