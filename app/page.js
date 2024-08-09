"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import { firestore } from "@/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AssistantIcon from "@mui/icons-material/Assistant";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import aiAssist from "./gemini";
import ReactMarkdown from "react-markdown";
import {
	Box,
	Modal,
	Stack,
	Button,
	TextField,
	Typography,
	Container,
	styled,
	Alert,
} from "@mui/material";
import {
	doc,
	getDoc,
	getDocs,
	collection,
	deleteDoc,
	query,
	setDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const CenteredContainer = styled(Container)(() => ({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	minHeight: "90vh",
}));

export default function Home() {
	const [user, loading] = useAuthState(auth);
	const router = useRouter();

	const [inventory, setInventory] = useState([]);
	const [open, setOpen] = useState(false);
	const [itemName, setItemName] = useState("");
	const [error, setError] = useState("");
	const [alertMessage, setAlertMessage] = useState("");
	const [aiText, setAiText] = useState("");

	const updateInventory = useCallback(async () => {
		if (!user) return;
		const userItemsCollection = collection(
			firestore,
			`users/${user.uid}/items`
		);
		const snapshot = query(userItemsCollection);
		const docs = await getDocs(snapshot);
		const inventoryList = [];
		docs.forEach((doc) => {
			inventoryList.push({
				name: doc.id,
				...doc.data(),
			});
		});
		setInventory(inventoryList);
	}, [user]);

	const getAIText = useCallback(async () => {
		if (inventory.length > 0) {
			const aiResponse = await aiAssist(JSON.stringify(inventory));
			if (aiResponse.error) {
				setAlertMessage(aiResponse.message);
			} else {
				setAlertMessage("");
				setAiText(aiResponse);
			}
		}
	}, [inventory]);

	const addItem = async (item) => {
		const docRef = doc(firestore, `users/${user.uid}/items/${item}`);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const { quantity } = docSnap.data();
			await setDoc(docRef, { quantity: quantity + 1 }, { merge: true });
		} else {
			await setDoc(docRef, { quantity: 1 }, { merge: true });
		}
		await updateInventory();
	};

	const removeItem = async (item) => {
		const docRef = doc(firestore, `users/${user.uid}/items/${item}`);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			const { quantity } = docSnap.data();
			if (quantity === 1) {
				await deleteDoc(docRef);
			} else {
				await setDoc(
					docRef,
					{ quantity: quantity - 1 },
					{ merge: true }
				);
			}
		}
		await updateInventory();
	};

	const deleteItemAll = async (item) => {
		const docRef = doc(firestore, `users/${user.uid}/items/${item}`);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			await deleteDoc(docRef);
		}
		await updateInventory();
	};

	useEffect(() => {
		if (!user && !loading) {
			return router.push("/sign-in");
		} else {
			updateInventory();
		}
	}, [user, loading, router, updateInventory]);

	useEffect(() => {
		updateInventory();
	}, [updateInventory]);

	useEffect(() => {
		getAIText();
	}, [getAIText]);

	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setOpen(false);
		setError("");
	};

	const columns = [
		{
			field: "name",
			headerName: "Item Name",
			flex: 0.5,
			align: "center",
			headerAlign: "center",
		},
		{
			field: "quantity",
			headerName: "Quantity",
			flex: 1,
			align: "center",
			headerAlign: "center",
		},
		{
			field: "actions",
			headerName: "Actions",
			sortable: false,
			flex: 0.75,
			align: "center",
			headerAlign: "center",
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "100%",
						width: "100%",
						gap: 1,
						padding: "0 8px",
					}}
				>
					<Button
						variant="contained"
						onClick={() => addItem(params.row.name)}
						sx={{
							minWidth: 0,
							fontSize: {
								xs: "0.75rem",
								sm: "1rem",
								md: "1rem",
							},
							padding: "4px",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<AddIcon />
					</Button>
					<Button
						variant="contained"
						onClick={() => removeItem(params.row.name)}
						sx={{
							minWidth: 0,
							fontSize: {
								xs: "0.75rem",
								sm: "1rem",
								md: "1rem",
							},
							padding: "4px",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<RemoveIcon />
					</Button>
					<Button
						variant="contained"
						onClick={() => deleteItemAll(params.row.name)}
						sx={{
							minWidth: 0,
							bgcolor: "red",
							fontSize: {
								xs: "0.75rem",
								sm: "1rem",
								md: "1rem",
							},
							padding: "4px",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<DeleteIcon />
					</Button>
				</Box>
			),
		},
	];

	return (
		<>
			{!user ? (
				<CenteredContainer>Not Authorized</CenteredContainer>
			) : (
				<>
					<Header loggedIn={true} />
					<Box
						width="100vw"
						height="100vh"
						display="flex"
						flexDirection="column"
						justifyContent="center"
						alignItems="center"
						gap={2}
						sx={{
							padding: 2,
							"@media (max-width: 600px)": {
								gap: 1,
							},
						}}
					>
						<Modal open={open} onClose={handleClose}>
							<Box
								position="absolute"
								top="50%"
								left="50%"
								width={{ xs: "90%", sm: 400 }}
								bgcolor="white"
								border="2px solid #000"
								boxShadow={24}
								p={4}
								display="flex"
								flexDirection="column"
								gap={3}
								sx={{
									transform: "translate(-50%, -50%)",
								}}
							>
								<Typography variant="h6">Add Item</Typography>
								<Stack
									component="form"
									width="100%"
									direction="row"
									spacing={2}
								>
									<TextField
										variant="outlined"
										fullWidth
										required
										value={itemName}
										onChange={(e) => {
											setItemName(e.target.value);
											if (error) setError("");
										}}
										error={!!error}
										helperText={error}
									/>
									<Button
										variant="outlined"
										onClick={() => {
											if (itemName) {
												addItem(itemName.toLowerCase());
												setItemName("");
												setError("");
												handleClose();
												getAIText();
											} else {
												setError(
													"Please enter an item name."
												);
											}
										}}
									>
										Add
									</Button>
								</Stack>
							</Box>
						</Modal>

						<Box
							border="1px solid #333"
							sx={{
								width: "100%",
								maxWidth: { xs: "100%", sm: "90%", md: "80%" },
								mx: "auto",
							}}
						>
							<Box
								width="100%"
								height={100}
								bgcolor="#ADD8E6"
								display="flex"
								alignItems="center"
								justifyContent="center"
								sx={{
									padding: 1,
									"@media (max-width: 600px)": {
										height: "auto",
									},
								}}
							>
								<Typography
									variant="h2"
									color="#333"
									sx={{
										fontSize: {
											xs: "1.5rem",
											sm: "2rem",
											md: "2.5rem",
										},
									}}
								>
									Inventory Items
								</Typography>
							</Box>

							<div
								style={{
									height: "auto",
									width: "100%",
									overflowX: "auto",
								}}
							>
								<Button
									variant="contained"
									onClick={() => {
										handleOpen();
									}}
									sx={{
										width: "100%",
										display: "flex",
										justifyContent: "center",
										alignContent: "center",
									}}
								>
									Add New Item
								</Button>
								<DataGrid
									rows={inventory}
									columns={columns}
									getRowId={(row) => row.name}
									disableColumnSelector
									disableRowSelectionOnClick
									disableColumnFilter
									disableColumnMenu={true}
									disableDensitySelector
									slots={{ toolbar: GridToolbar }}
									slotProps={{
										toolbar: {
											showQuickFilter: true,
										},
									}}
									initialState={{
										density: "comfortable",
										pagination: {
											paginationModel: {
												page: 0,
												pageSize: 5,
											},
										},
									}}
									pageSizeOptions={[5, 10]}
									sx={{
										minHeight: 300,
										height: { xs: 300, sm: 400 },
										width: "100%",
									}}
								/>
								<Box
									bgcolor={"#ADDE9E"}
									component={"div"}
									sx={{
										background:
											"linear-gradient(135deg, #ADE9E9, #E9ADDE)",
										padding: 3,
										position: "relative",
									}}
								>
									{alertMessage && (
										<Alert
											variant="filled"
											severity="error"
										>
											{alertMessage}
										</Alert>
									)}
									<Typography
										variant="h6"
										sx={{
											fontWeight: "bold",
											color: "#333",
											marginBottom: 1,
										}}
									>
										<AssistantIcon
											sx={{
												fontSize: "20px",
												position: "relative",
												top: "4px",
											}}
										/>{" "}
										What you can do:
									</Typography>
									<div
										style={{
											marginLeft: "2%",
											color: "#333",
											lineHeight: "1.5rem",
											overflow: "scroll",
											overflowY: "auto",
											maxHeight: "150px",
										}}
									>
										{inventory.length > 0 ? (
											<ReactMarkdown>
												{aiText}
											</ReactMarkdown>
										) : (
											"Please add items to your inventory so that I may be able to assist you :)"
										)}
									</div>
								</Box>
							</div>
						</Box>
					</Box>
				</>
			)}
		</>
	);
}
