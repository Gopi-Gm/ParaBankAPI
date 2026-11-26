import { faker } from '@faker-js/faker';

export class RandomDataUtil {
    // ==================== Person ====================

    static getFirstName(): string {
        return faker.person.firstName();
    }

    static getLastName(): string {
        return faker.person.lastName();
    }

    static getFullName(): string {
        return faker.person.fullName();
    }

    static getEmail(): string {
        return faker.internet.email();
    }

    static getPhoneNumber(): string {
        return faker.phone.number();
    }

    static getUsername(): string {
        return faker.internet.username();
    }

    static getPassword(length: number = 10): string {
        return faker.internet.password({ length });
    }

    static getCountry(): string {
        return faker.location.country();
    }

    static getState(): string {
        return faker.location.state();
    }

    static getCity(): string {
        return faker.location.city();
    }

    static getStreet(): string {
        return faker.location.street();
    }

    static getStreetAddress(): string {
        return faker.location.streetAddress();
    }

    static getZipCode(): string {
        return faker.location.zipCode();
    }

    static getLatitude(): string {
        return faker.location.latitude().toString();
    }

    static getLongitude(): string {
        return faker.location.longitude().toString();
    }

    // ==================== Date & Time ====================

    static getCurrentDate(): string {
        return faker.date.recent().toISOString().split('T')[0];
    }

    static getRecentDate(days: number = 10): string {
        return faker.date.recent({ days }).toISOString().split('T')[0];
    }

    static getFutureDate(years: number = 1): string {
        return faker.date.future({ years }).toISOString().split('T')[0];
    }

    static getPastDate(years: number = 1): string {
        return faker.date.past({ years }).toISOString().split('T')[0];
    }

    // ==================== Banking Amounts & Numbers ====================

    static getAmount(min: number = 10, max: number = 1000): number {
        return faker.number.float({ min, max, fractionDigits: 2 });
    }

    static getNumber(min: number = 1, max: number = 999): number {
        return faker.number.int({ min, max });
    }

    static getAccountNumber(): string {
        return faker.number.int({ min: 10000, max: 99999 }).toString();
    }

    static getSSN(): string {
        return faker.string.numeric('###-##-####');
    }

    // ==================== ParaBank API Payload Generators ====================

    static generateInvalidLoginPayload() {
        return {
            username: this.getUsername(),
            password: this.getPassword()
        };
    }

    static generatePayeePayload() {
        return {
            name: faker.company.name(),
            address: {
                street: this.getStreetAddress(),
                city: this.getCity(),
                state: this.getState(),
                zipCode: this.getZipCode()
            },
            phoneNumber: this.getPhoneNumber(),
            accountNumber: this.getAccountNumber()
        };
    }

    static generateCustomerProfile() {
        return {
            firstName: this.getFirstName(),
            lastName: this.getLastName(),
            street: this.getStreetAddress(),
            city: this.getCity(),
            state: this.getState(),
            zipCode: this.getZipCode(),
            phoneNumber: this.getPhoneNumber(),
            ssn: this.getSSN()
        };
    }

    static generateLoanApplication(customerId: number, accountId: number, amount: number = 1000, downPayment: number = 250) {
        return {
            customerId,
            amount,
            downPayment,
            fromAccountId: accountId
        };
    }

    static generateStockPosition(accountId: number, symbol: string = 'MSFT', shares: number = 5, pricePerShare: number = 320.00) {
        return {
            accountId,
            name: symbol === 'MSFT' ? 'Microsoft Corp' : faker.company.name(),
            symbol,
            shares,
            pricePerShare
        };
    }

    static generateTransferData(fromAccountId: number, toAccountId: number, amount: number = 50.00) {
        return {
            fromAccountId,
            toAccountId,
            amount
        };
    }

    static generateDepositData(accountId: number, amount: number = 100.00) {
        return {
            accountId,
            amount
        };
    }
}