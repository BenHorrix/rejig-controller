import fetch from 'node-fetch'

const requestParams = {
  headers: {
    Accept: "application/json",
    "x-api-version": "2",
  },
};

const authoritiesService = {
  getAuthorities: async function () {
    let authoritiesResponse = null;

    try {
      authoritiesResponse = await fetch(
        "http://api.ratings.food.gov.uk/Authorities",
        requestParams
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Unable to access FSA API" });
    }

    const authoritiesParsed = await authoritiesResponse.json();

    const response = authoritiesParsed.authorities.map((json) => {
      return {
        id: json.LocalAuthorityId,
        name: json.Name,
      };
    }, authoritiesParsed);

    return response;
  },

  getAuthority: async function (authorityId) {
    if (isNaN(authorityId)) {
      return res
        .status(400)
        .json({ error: "No valid authority ID was specified" });
    }

    try {
      let establishmentsResponse = await fetch(
        `http://api.ratings.food.gov.uk/Establishments?localAuthorityId=${authorityId}`,
        requestParams
      );
      let { establishments } = await establishmentsResponse.json();

      const numberOfEstablishments = establishments.length;

      const rankedRatings = establishments.reduce((acc, { RatingValue }) => {
        const currentRating = acc.find(({ name }) => name === RatingValue);
        if (currentRating) {
          console.log(acc, RatingValue);
          currentRating.value++;
        } else {
          console.log(acc, RatingValue);
          acc.push({ name: RatingValue, value: 1 });
        }
        return acc;
      }, []);

      console.log({ rankedRatings });

      const percentageRatings = rankedRatings.map(({ name, value }) => ({
        name,
        value: Number(((value / numberOfEstablishments) * 100).toFixed(2)),
      }));

      console.log({ percentageRatings });

      return percentageRatings;
    } catch (err) {
      console.log(err);
      throw "There was an error accessing the FSA API";
    }
  },
};

let authorities = await authoritiesService.getAuthorities();
console.log({ authorities });
for (let i = 0; i < authorities.length; i++) {
  console.log({ authority: await authoritiesService.getAuthority(authorities[i].id) });
}