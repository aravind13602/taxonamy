async function fetchSortedDistricts(searchDistrict) {
    const statusElement = document.getElementById("status");
    const districtListElement = document.getElementById("districtList");

    statusElement.textContent = "Loading...";
    districtListElement.innerHTML = "";

    try {
        const response = await fetch("districts.json");
        const districtsData = await response.json();

        const searchedDistrict = districtsData.find(
            (d) => d.district.toLowerCase() === searchDistrict.toLowerCase()
        );

        if (!searchedDistrict) {
            statusElement.textContent = "District not found in the dataset!";
            return;
        }

        
        const { latitude: districtLat, longitude: districtLon } = searchedDistrict;


        const sortedDistricts = districtsData
            .map((district) => {
                const distance = calculateDistance(
                    districtLat,
                    districtLon,
                    district.latitude,
                    district.longitude
                );
                return { ...district, distance };
            })
            .sort((a, b) => a.distance - b.distance);

       
        statusElement.textContent = `Found ${sortedDistricts.length} districts.`;
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
    const districtName = document.getElementById("districtInput").value.trim();
    if (districtName) {
        fetchSortedDistricts(districtName);
    } else {
        alert("Please enter a district name.");
    }
});
