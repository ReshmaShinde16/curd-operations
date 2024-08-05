import axios from "axios";

export const verifyPan = async (panNumber) => {
  try {
    const response = await axios.post(
      `https://lab.pixel6.co/api/verify-pan.php`,
      { panNumber },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying PAN:", error);
    throw error;
  }
};

export const getPostcodeDetails = async (postcode) => {
  try {
    const response = await axios.post(
      `https://lab.pixel6.co/api/get-postcode-details.php`,
      { postcode },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching postcode details:", error);
    throw error;
  }
};
