export default function Card() {
    return (
        <div className="card bg-base-100 w-96 shadow-sm">
            <figure>
                <img src="Purple.svg" alt="Exercise" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">Excersice</h2>
                <p className="italic">Algo sobre el ejercicio</p>
                <div className="card-actions justify-start">
                    <button className="btn btn-primary">Start</button>
                </div>
            </div>
        </div>
    );
}
