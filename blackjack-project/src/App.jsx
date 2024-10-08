import React, { useState, useEffect } from 'react';

const suits = ['diamonds', 'hearts', 'clubs', 'spades'];
const ranks = [...Array(9).keys()].map(i => i + 2).concat(['ace', 'jack', 'queen', 'king']);

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const generateDeck = (numDecks) => {
  let deck = []
  for (let i = 0; i < numDecks; i++) {
    for (let rank_index = 0; rank_index < ranks.length; rank_index++) {
      for (let suit_index = 0; suit_index < suits.length; suit_index++) {
        deck = [...deck, [ranks[rank_index], suits[suit_index]]];
      }
    }
  }
  return deck
}

const generateCard = (deck) => {
  // const suit = suits[Math.floor(Math.random() * suits.length)];
  // const rank = ranks[Math.floor(Math.random() * ranks.length)];
  const card_index = Math.floor(Math.random() * deck.length);
  const card = deck[card_index];
  deck.splice(card_index, 1);
  return card
  // return { rank, suit };
};

const sumCards = (cards) => {
  let values = cards.map(card => {
    if (['jack', 'queen', 'king'].includes(card[0])) return 10;
    if (card[0] === 'ace') return 11;
    return card[0];
  });

  while (values.reduce((a, b) => a + b, 0) > 21 && values.includes(11)) {
    values[values.indexOf(11)] = 1;
  }

  return values.reduce((a, b) => a + b, 0);
};

const Blackjack = () => {
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [deck, setDeck] = useState([]);
  const [playerChips, setPlayerChips] = useState(10);
  const [dealerChips, setDealerChips] = useState(10);
  const [bet, setBet] = useState(0);
  const [dealerCardShown, setDealerCardShown] = useState(false);
  const [message, setMessage] = useState('');
  
  // Reset for a new round
  const roundReset = () => {
    setPlayerCards([]);
    setDealerCards([]);
    setBet(0);
    setDealerCardShown(false);
    setMessage('');
    if (deck.length <= 15) {
      shuffleDeck()
    }
  };

  // Start a new game
  const gameReset = () => {
    roundReset();
    setPlayerChips(10);
    setDealerChips(10);
    shuffleDeck()
  };

  const shuffleDeck = () => {
    setDeck(generateDeck(1));
  }

  // Deal two cards to both player and dealer
  const dealCards = () => {
    const newPlayerCards = [generateCard(deck), generateCard(deck)];
    const newDealerCards = [generateCard(deck), generateCard(deck)];
    setPlayerCards(newPlayerCards);
    setDealerCards(newDealerCards);
  };

  const handleBet = (amount) => {
    if (amount <= playerChips && playerCards.length == 0) {
      setBet(bet + amount);
      setPlayerChips(playerChips - amount);
    }
  };

  const handleHit = () => {
    if (playerCards.length > 0) {
      let newCard = generateCard(deck)
      setPlayerCards([...playerCards, newCard]);
      if (sumCards([...playerCards, newCard]) > 20) {
        determineWinner(sumCards(dealerCards), sumCards([...playerCards, newCard]));
      }
    }
  };

  // Dealer draws here 
  const handleStand = async() => {
    setDealerCardShown(true);
    let dealerSum = sumCards(dealerCards);
    let newDealerCards = [];
    while (dealerSum < 17) {
      await sleep(2000);
      const newCard = generateCard(deck);
      if (newDealerCards.length > 0) {
        newDealerCards = [...newDealerCards, newCard];
      } else {
        newDealerCards = [...dealerCards, newCard];
      }
      setDealerCards(newDealerCards);
      dealerSum = sumCards(newDealerCards);
    }
    determineWinner(dealerSum, sumCards(playerCards));
  };

  const determineWinner = async(dealerSum, playerSum) => {

    let newPlayerChips = playerChips

    if (playerSum > 21) {
      setMessage('You went over! Dealer wins.');
    } else if (dealerSum > 21 || playerSum > dealerSum) {
      setMessage('You win!');
      newPlayerChips = playerChips + bet * 2
      setPlayerChips(newPlayerChips);
    } else if (playerSum === dealerSum) {
      setMessage('Push!');
      newPlayerChips = playerChips + bet
      setPlayerChips(newPlayerChips);
    } else {
      setMessage('Dealer wins!');
    }
    await sleep(3000);
    if (newPlayerChips <= 0) {
      gameReset();
    } else {
      roundReset();
    }
  };

  // Game loop (React useEffect can handle game reset)
  useEffect(() => {
    gameReset();
  }, []);

  return (
    <div>
      <h1>Blackjack Game</h1>

      <span>Number of cards in deck: {deck.length}</span>

      {/* Player Chips and Bet */}
      <p>Player Chips: {playerChips}</p>
      <p>Bet: {bet}</p>

      {/* Player Cards */}
      <h2>Your Cards</h2>
      <div>
        {playerCards.map((card, index) => (
          <span key={index}>{card[0]} of {card[1]} </span>
        ))}
        <p>Sum: {sumCards(playerCards)}</p>
      </div>

      {/* Dealer Cards */}
      <h2>Dealer's Cards</h2>
      <div>
        {dealerCardShown ? (
          <>
            {dealerCards.map((card, index) => (
              <span key={index}>{card[0]} of {card[1]} </span>
            ))}
            <p>Sum: {sumCards(dealerCards)}</p>
          </>
        ) : (
          dealerCards.length > 0 && <><span>{dealerCards[0][0]} of {dealerCards[0][1]}</span> <p>Sum: {sumCards([dealerCards[0]])}</p></>
        )}
      </div>

      {/* Actions */}
      <div>
        {playerCards.length > 0 ? (
          <>
            <button onClick={handleHit}>Hit</button>
            <button onClick={handleStand}>Stand</button>
          </>
        ):(
          <>
            <button onClick={() => handleBet(1)}>Bet 1</button>
            <button onClick={dealCards}>Finished Betting</button>
          </>
        )}
      </div>

      {/* Game Messages */}
      <p>{message}</p>
    </div>
  );
};

export default Blackjack;
