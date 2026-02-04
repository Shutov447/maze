export interface AugmentedRequest extends Request {
    params: Record<string, string>;
}
