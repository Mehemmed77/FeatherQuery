import useMutation from "./hooks/useMutation";

type A = {

}

type B = {

}

const a = useMutation<B, Error, A>({ mutateFn: async (variables: A): Promise<B> => {
	// Add your mutation logic here
	throw new Error('Not implemented');
}});   