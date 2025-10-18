const axios = require('axios');

// AniList GraphQL API endpoint
const ANILIST_API = 'https://graphql.anilist.co';

// Character data to update
const characters = [
  { name: "Naruto Uzumaki", anime: "Naruto" },
  { name: "Monkey D. Luffy", anime: "One Piece" },
  { name: "Edward Elric", anime: "Fullmetal Alchemist" },
  { name: "Goku", anime: "Dragon Ball" },
  { name: "Levi Ackerman", anime: "Attack on Titan" },
  { name: "Izuku Midoriya", anime: "My Hero Academia" },
  { name: "Light Yagami", anime: "Death Note" },
  { name: "Tengen Uzui", anime: "Demon Slayer" },
  { name: "Satoru Gojo", anime: "Jujutsu Kaisen" },
  { name: "Ken Kaneki", anime: "Tokyo Ghoul" },
  { name: "Ichigo Kurosaki", anime: "Bleach" },
  { name: "Natsu Dragneel", anime: "Fairy Tail" },
  { name: "Kirigaya Kazuto", anime: "Sword Art Online" },
  { name: "Rintaro Okabe", anime: "Steins;Gate" },
  { name: "Gon Freecss", anime: "Hunter x Hunter" }
];

async function getCharacterImage(characterName) {
  const query = `
    query ($search: String) {
      Character(search: $search) {
        id
        name {
          full
        }
        image {
          large
          medium
        }
      }
    }
  `;

  try {
    const response = await axios.post(ANILIST_API, {
      query,
      variables: { search: characterName }
    });

    const character = response.data.data.Character;
    if (character && character.image) {
      return character.image.large || character.image.medium;
    }
  } catch (error) {
    console.error(`Error fetching image for ${characterName}:`, error.message);
  }
  return null;
}

async function updateCharacterImages() {
  console.log('Fetching character images from AniList...');

  const updatedCharacters = [];

  for (const character of characters) {
    console.log(`Fetching image for ${character.name}...`);
    const imageUrl = await getCharacterImage(character.name);

    if (imageUrl) {
      updatedCharacters.push({
        ...character,
        image: imageUrl
      });
      console.log(`✓ Found image for ${character.name}`);
    } else {
      console.log(`✗ No image found for ${character.name}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\nUpdated character data:');
  console.log(JSON.stringify(updatedCharacters, null, 2));
}

updateCharacterImages();