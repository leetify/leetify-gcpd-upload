// Promise that can be resolved and rejected from outside
// from https://lea.verou.me/2016/12/resolve-promises-externally-with-this-one-weird-trick/ (Lea Verou and Joseph Silber)
//
// Usage:
// const isSomethingDone = defer();
//
// // do something, e.g. establish a connection, then call
// isSomethingDone.resolve();
//
// // in methods dependant on the connection to be established, just:
// await isSomethingDone;
//
// // the Promise can also be rejected, which will reject all Promises and methods containing `await isSomethingDone`:
// isSomethingDone.reject();

export const defer = <T>() => {
	let res: (v: T | PromiseLike<T>) => void;
	let rej: (err?: unknown) => void;

	const promise: Promise<T> & {
		resolve: (v: T | PromiseLike<T>) => void;
		reject: (err?: unknown) => void;
	} = new Promise<T>((resolve, reject) => {
		res = resolve;
		rej = reject;
	}) as any;

	promise['resolve'] = res!;
	promise['reject'] = rej!;

	return promise;
};
