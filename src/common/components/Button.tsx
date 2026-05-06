type ButtonProps = {
    name: string;
};

export default function Button({ name }: ButtonProps) {
    return (
        <div>
            <button className="btn btn-neutral">{name}</button>
        </div>
    );
}
