"use strict";

/*
 * The collection — 100 little artworks, drawn by code, each one for Himena.
 *
 * Ammar & Himena (Mena): two countries, one sky. Met on Free Fire, close
 * like they have always known each other. White is her favourite colour,
 * pizza is her favourite food, and she loves art and nature.
 *
 * Each piece is deterministic: its title, style, palette, and seed together
 * always draw the same artwork. Change a seed for a brand-new piece.
 */
(function () {
  const STYLES = [
    "bloom", "constellation", "meadow", "petals", "ripples",
    "mountain", "weave", "mosaic", "orbit", "rain"
  ];

  const PALETTES = [
    "snow", "blush", "sage", "wildflower", "romania", "pakistan",
    "pizza", "moonlight", "sunset", "forest", "frost", "ember"
  ];

  const TITLES = [
    "The Day We Met Online", "Two Countries, One Sky", "White, Like Everything You Love",
    "First Squad, First Smile", "Bucharest to Karachi", "A Garden That Is You",
    "Pizza and Promises", "Since Before We Were Born", "Your Quiet Art", "Softly, Like Snow",
    "The Long Way Home To You", "Nightfall Over Romania", "Green And White",
    "Blue, Yellow, Red", "Drawn By Code, Meant For You", "A Hundred Little Things",
    "The Drop Zone", "Our First Win", "Fields Of Wildflowers", "Something We Built",
    "Distance Is Just A Shape", "The Shape Of Your Laugh", "Moonlight On Two Cities",
    "Paper Petals Falling", "A Meadow In September", "The Mountains Between Us",
    "Woven From Two Homes", "Tiles Of Us", "Everything Orbits You", "Falling, Gently, Always",
    "The Colour Of Your Silence", "Blush, Barely", "Constellations We Named",
    "A Sky That Ignores Borders", "Pizza Night In Two Timezones", "Art Is Love Paying Attention",
    "The Free Fire Feather", "First Muzzle, First Feeling", "Green Light, Go", "Waiting At The Spawn",
    "Whisper Me A Wish", "The Space Between Pings", "Nine Thousand Kilometres",
    "But You Feel Close", "Handmade, All Of It", "For The Girl Who Draws The World",
    "White Petal, White Noise", "A Dozen Reasons To Stay Awake", "Your Name Means Something To Me",
    "Halfway Is Still A Place", "The Art Of Missing You", "Rain On The Window Between Us",
    "The Same Moon", "Soft Storm", "I Built You A Garden", "I Built You A Sky",
    "I Built You A Hundred Things", "Because Words Weren't Enough", "So I Made You This",
    "From My Hand To Yours", "Pizza Crust Compass", "The Warm Side Of Distance",
    "Romania Blossoms", "Pakistan Peaks", "Two Flags, One Heart",
    "The Colour White Holds Everything", "A Blank Page Is A Promise", "Paint Me In Yours",
    "The Studio In My Head", "Every Line Is For You", "Bloom, Anyway",
    "Ripple, Outward", "Orbit, Patient", "Weave, Careful", "Mosaic, Patiently",
    "Petal, Floating", "Rain, Welcome", "Mountain, Waiting", "Constellation, Ours",
    "Meadow, Yours", "A Hundred Times Yes", "Five Weeks That Felt Like Home",
    "The Day Time Got Softer", "You, At 2AM", "The Kindness In Your Voice",
    "A Little Farther, A Little Closer", "Every Game, Every Goodnight", "The Way You Say My Name",
    "Ammar And Himena", "Mena, Simply", "White Room, Full Heart", "Art For The Artful",
    "Nature Knows What We Are", "The Longest Short Month", "Keep This One Close",
    "A Present Made Of Shapes", "Because You Like Art", "And I Like You",
    "This Is Number Ninety-Nine", "And One Hundred More"
  ];

  const TAG_WORDS = {
    nature: ["garden", "meadow", "mountain", "field", "wildflower", "nature", "petal", "petals", "blossom", "sky", "rain", "moon", "forest", "snow", "nightfall", "orbit", "constellation"],
    pizza: ["pizza"],
    art: ["art", "drawn", "studio", "paint", "page", "handmade", "colour", "color", "shapes", "draws"],
    romania: ["romania", "bucharest", "blue", "yellow", "red", "romanian"],
    pakistan: ["pakistan", "karachi", "green"],
    freefire: ["free fire", "squad", "zone", "muzzle", "spawn", "drop", "win", "game", "feather", "ping"],
    distance: ["distance", "kilometres", "countries", "timezone", "far", "farther", "between", "two", "halfway", "space", "long", "longest", "close", "closer"],
    always: ["always", "forever", "stays", "keep", "stay"]
  };

  function tagWordsFor(title) {
    const text = title.toLowerCase();
    const found = [];
    Object.keys(TAG_WORDS).forEach(function (tag) {
      const words = TAG_WORDS[tag];
      for (let k = 0; k < words.length; k += 1) {
        if (text.indexOf(words[k]) >= 0) {
          found.push(tag);
          return;
        }
      }
    });
    return found;
  }

  const works = TITLES.map(function (title, i) {
    return {
      id: i + 1,
      title: title,
      style: STYLES[i % STYLES.length],
      palette: PALETTES[i % PALETTES.length],
      seed: 1000 + i * 7919,
      tags: tagWordsFor(title)
    };
  });

  window.MENA_ART = works;
  window.MENA_ART_META = {
    owner: "Ammar",
    for: "Himena (Mena)",
    subtitle: "One hundred little artworks, drawn by code, each one for you."
  };
})();
