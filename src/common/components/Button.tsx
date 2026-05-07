type ButtonProps = {
    name: string;
    type?: 'button' | 'submit' | 'reset';
};

export default function Button({ name, type = 'submit' }: ButtonProps) {
    return (
        <div>
            <button type={type} className="btn btn-neutral">
                {name}
            </button>
        </div>
    );
}
