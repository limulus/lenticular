import sinon from 'sinon'
import awsMocker from 'aws-sdk-mock'

export function stub (service, method) {
  const stub = sinon.stub()
  awsMocker.mock(service, method, stub)
  return stub
}

export {restore} from 'aws-sdk-mock'
