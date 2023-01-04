export type IRequest = {
  id: any,
  cred_plus_upfront: string,
  creditclan_request_id: number,
  no_of_months: number,
  items: Array<{
    name: string,
    primary_picture: string,
    price: number,
    item_plan: {
      id,
      plan: {
        total: number,
        outright: number,
        duration: number,
        monthly: number
      }
    }
  }>,
};

export interface ICustomer {
  id: string,
  phone: string,
  full_name: string,
  email: string,
  picture: string,
  bank_id: number,
  account_number: number,
  account_name: number,
  gender: number,
  date_of_birth: string,
  bank_code: null,
  card: null,
  card_exists: false,
  address: '',
  work: {
    id: null,
    company_name: null,
    net_monthly_income: null,
    occupation: null,
    sector: null,
    work_address: null
  },
  state: null,
  lga: null,
  attachments: null,
  identity: null,
  frequently_called_numbers: null
}
