
async function fetchSortedDistricts(searchTerm) {
    const statusElement = document.getElementById("status");
    const districtListElement = document.getElementById("districtList");

    statusElement.textContent = "Loading...";
    districtListElement.innerHTML = "";

    try {
        const response = await fetch("updated_districts.json");
        const districtsData = await response.json();

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const searchedDistrict = districtsData.find(
            (d) => d.district.toLowerCase() === lowerCaseSearchTerm
        );

        const stateDistricts = districtsData.filter(
            (d) => d.state.toLowerCase() === lowerCaseSearchTerm
        );

        if (!searchedDistrict && stateDistricts.length === 0) {
            statusElement.textContent = "No matching district or state found in the dataset!";
            return;
        }

        let referenceLatitude, referenceLongitude;

        if (searchedDistrict) {
            referenceLatitude = searchedDistrict.latitude;
            referenceLongitude = searchedDistrict.longitude;
            statusElement.textContent = `Sorting all districts based on proximity to ${searchedDistrict.district}.`;
        } else if (stateDistricts.length > 0) {
            referenceLatitude = stateDistricts[0].latitude;
            referenceLongitude = stateDistricts[0].longitude;
            statusElement.textContent = `Sorting all districts based on proximity to ${stateDistricts[0].state}.`;
        }

        const sortedDistricts = districtsData
            .map((district) => {
                const distance = calculateDistance(
                    referenceLatitude,
                    referenceLongitude,
                    district.latitude,
                    district.longitude
                );
                return { ...district, distance };
            })
            .sort((a, b) => a.distance - b.distance);

        districtListElement.innerHTML = "";
        sortedDistricts.forEach((district) => {
            const listItem = document.createElement("li");
            listItem.textContent = `${district.district}, ${district.state} (Distance: ${district.distance.toFixed(2)} km)`;
            districtListElement.appendChild(listItem);
        });
    } catch (error) {
        statusElement.textContent = "Error loading district data.";
        console.error("Error:", error);
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

document.getElementById("searchButton").addEventListener("click", () => {
    const searchTerm = document.getElementById("districtInput").value.trim();
    if (searchTerm) {
        fetchSortedDistricts(searchTerm);
    } else {
        alert("Please enter a district or state name.");
    }
});
