"use client";

import { useState, useEffect } from "react";
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
import { auth } from "../../firebase";
import {
	useSignInWithEmailAndPassword,
	useAuthState,
} from "react-firebase-hooks/auth";
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

const SignIn = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
	const [user, loading] = useAuthState(auth);

	const router = useRouter();

	useEffect(() => {
		if (user) {
			return router.push("/");
		}
	}, [user, router]);

	const handleSignIn = async (e) => {
		e.preventDefault();
		try {
			await signInWithEmailAndPassword(email, password);
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
							Sign In
						</Typography>
						<Box
							component="form"
							onSubmit={handleSignIn}
							sx={{ mt: 1 }}
						>
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								autoFocus
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
								Sign In
							</Button>
							<Typography>
								Don&apos;t have an account?{" "}
								<a href="/sign-up">Sign Up</a>
							</Typography>
						</Box>
					</StyledPaper>
				</CenteredContainer>
			)}
		</>
	);
};

export default SignIn;
