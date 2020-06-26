import sinon, { SinonStub } from "sinon";
import faker from "faker";
import { redirect } from "../src"

const sandbox = sinon.createSandbox();
const { lorem: { word }, internet: { url } } = faker;

describe("Safe Redirection Unit Tests", () => {
  const { location } = window;
  let mockRedirectionQueryKey: string;
  let mockRedirectionQueryValue: string;

  beforeEach(() => {
    delete window.location;
    let mockLocation: Location;
    mockRedirectionQueryKey = word();
    mockRedirectionQueryValue = `/${word()}`;
    const mockSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    const mockUrl = `${url()}${mockSearch}`;
    mockLocation = {
      assign: sandbox.stub(),
      replace: sandbox.stub(),
      reload: () => {},
      search: mockSearch,
      protocol: "",
      port: "",
      pathname: "",
      origin: "",
      href: mockUrl,
      hostname: "",
      host: "",
      hash: "",
      ancestorOrigins: {} as DOMStringList,
    };
    window.location = mockLocation
  })

  afterEach(() => {
    sandbox.verifyAndRestore();
    window.location = location;
  });

  it("should redirect to given parameter's query parameter value", () => {
    // Arrange

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;
    expect(assignStub.calledWith(mockRedirectionQueryValue)).toBe(true);
  });

  it("should redirect to /", () => {
    // Arrange

    // Act
    redirect("");

    // Assert
    const assignStub = window.location.assign as SinonStub;
    expect(assignStub.calledWith("/")).toBe(true);
  });

  it("should redirect with preserving callbacks query params", () => {
    // Arrange
    const queryKey1 = word();
    const queryValue1 = word();
    const queryKey2 = word();
    const queryValue2 = word();
    const query = `${queryKey1}=${queryValue1}&${queryKey2}=${queryValue2}`;
    const localSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}?${query}`;
    window.location.search = localSearch;
    window.location.href = `${url()}${localSearch}`;

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;

    const searchParams = new URL(`${url()}${assignStub.getCall(0).args[0]}`).searchParams;

    expect(searchParams.get(queryKey1)).toBe(queryValue1);
    expect(searchParams.get(queryKey2)).toBe(queryValue2);
  });

  it("should escape other domains", () => {
    // Arrange
    mockRedirectionQueryKey = word();
    mockRedirectionQueryValue = `https://www.google.com`;
    const mockSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    const mockUrl = `${url()}${mockSearch}`;

    window.location.href = mockUrl;
    window.location.search = mockSearch;

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;
    expect(assignStub.calledWith("/")).toBe(true);
  });

  it("should escape javascript", () => {
    // Arrange
    mockRedirectionQueryKey = word();
    mockRedirectionQueryValue = `javascript:alert('hey')`;
    const mockSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    const mockUrl = `${url()}${mockSearch}`;

    window.location.href = mockUrl;
    window.location.search = mockSearch;

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;

    expect(assignStub.calledWith("alert('hey')")).toBe(true);
  });
});