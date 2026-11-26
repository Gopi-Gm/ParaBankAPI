export class Helper {
    static convertPriceToNumber(price: string): number {
        const cleaned = price.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned);
    }

    static getLoginDetails() {
        return {
            username: process.env.PARABANK_USERNAME || 'john',
            password: process.env.PARABANK_PASSWORD || 'demo'
        };
    }

    static getCustomerDetails() {
        return {
            customerId: Number(process.env.CUSTOMER_ID) || 12212,
            firstName: 'John',
            lastName: 'Smith'
        };
    }

    static getAccountDetails() {
        return {
            primaryAccountId: Number(process.env.PRIMARY_ACCOUNT_ID) || 12345,
            secondaryAccountId: Number(process.env.SECONDARY_ACCOUNT_ID) || 12456
        };
    }
}
