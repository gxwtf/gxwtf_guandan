export function CardHand({ cards }: { cards: string[] }) {
  return (
    <div className="card-hand">
      {cards.map((card) => (
        <img
          key={card}
          src={`/cards/${card.replace(' ', '_')}.svg`}
          className="card-image"
          alt={card}
        />
      ))}
    </div>
  );
}