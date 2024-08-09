const {
	GoogleGenerativeAI,
	HarmCategory,
	HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash",
});

const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 64,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
};

async function aiAssist(inventory) {
	try {
		const chatSession = model.startChat({
			generationConfig,
			// safetySettings: Adjust safety settings
			// See https://ai.google.dev/gemini-api/docs/safety-settings
			history: [
				{
					role: "user",
					parts: [
						{
							text: "Based on the following list of real, tangible items in an inventory management system, succinctly list out what a user can do with each item. Include actions such as how the item can be used, combined with other items, or any other useful information. Only consider items that are safe for humans. Output a formatted markdown.If there is an overlap between items (a recipe, name the item you can create). DONT repeat yourself for each item. Keep in mind quantity of items. Only return bullet points and no other text such as 'here are somethings the user can do..'. no need to refer to the user. DONT ASK USER FOLLOW UP QUESTIONS.",
						},
					],
				},
				{
					role: "model",
					parts: [
						{
							text: "Please provide me with the list of items in your inventory.",
						},
					],
				},
			],
		});
		const json = await chatSession.sendMessage(inventory);
		return json.response.candidates[0].content.parts[0].text;
	} catch (error) {
		return {
			message:
				"AI use has been exhausted, please try again in a few moments",
			error,
		};
	}
}

export default aiAssist;
