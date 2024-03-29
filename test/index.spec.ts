import sinon, { SinonStub } from "sinon";
import faker from "faker";
import { redirect } from "../src"

const sandbox = sinon.createSandbox();
const { lorem, internet: { url } } = faker;

const word = () => `${lorem.word()}${lorem.word()}`; // to reduce collusions

describe("Safe Redirection Unit Tests", () => {
  const { location } = window;
  let mockRedirectionQueryKey: string;
  let mockRedirectionQueryValue: string;
  let origin: string;

  beforeEach(() => {
    delete window.location;
    let mockLocation: Location;
    origin = url();
    mockRedirectionQueryKey = word();
    mockRedirectionQueryValue = `/${word()}`;
    const mockSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    const mockUrl = `${origin}${mockSearch}`;

    mockLocation = {
      assign: sandbox.stub(),
      replace: sandbox.stub(),
      reload: () => {},
      search: mockSearch,
      protocol: "",
      port: "",
      pathname: "",
      origin,
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
    expect(assignStub.calledWith(`${origin}${mockRedirectionQueryValue}`)).toBe(true);
  });

  it("should redirect to /", () => {
    // Arrange
    const localSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    window.location.search = localSearch;

    // Act
    redirect("");

    // Assert
    const assignStub = window.location.assign as SinonStub;
    expect(assignStub.calledWith(`${origin}/${localSearch}`)).toBe(true);
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

  it("should redirect with preserving hash", () => {
    // Arrange
    const localHash = `#${word()}`;
    const localSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}${localHash}`;
    window.location.search = localSearch;
    window.location.href = `${url()}${localSearch}`;

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;

    expect(new URL(`${url()}${assignStub.getCall(0).args[0]}`).hash).toBe(localHash);
  });

  it("should redirect with preserving callbacks query params and hash", () => {
    // Arrange
    const queryKey1 = word();
    const queryValue1 = word();
    const queryKey2 = word();
    const queryValue2 = word();
    const localHash = `#${word()}`;
    const query = `${queryKey1}=${queryValue1}&${queryKey2}=${queryValue2}`;
    const localSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}?${query}${localHash}`;
    window.location.search = localSearch;
    window.location.href = `${url()}${localSearch}`;

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;

    const calledUrl = new URL(`${url()}${assignStub.getCall(0).args[0]}`);

    const searchParams = calledUrl.searchParams;

    expect(searchParams.get(queryKey1)).toBe(queryValue1);
    expect(searchParams.get(queryKey2)).toBe(queryValue2);
    expect(calledUrl.hash).toBe(localHash);
  });

  it("should escape other domains", () => {
    // Arrange
    mockRedirectionQueryKey = word();
    mockRedirectionQueryValue = `https://www.google.com`;
    const mockSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    const mockUrl = `${origin}${mockSearch}`;

    window.location.href = mockUrl;
    window.location.search = mockSearch;

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;
    expect(assignStub.calledWith(`${origin}/`)).toBe(true);
  });

  it("should escape other domains with encode", () => {
    // Arrange
    mockRedirectionQueryKey = word();
    mockRedirectionQueryValue = `http%3A%2F%2Fgoogle.com`;
    const mockSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    const mockUrl = `${origin}${mockSearch}`;

    window.location.href = mockUrl;
    window.location.search = mockSearch;

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;
    expect(assignStub.calledWith(`${origin}/`)).toBe(true);
  });

  it("should escape javascript and other invalid domains", () => {
    // Arrange
    const errorStub = sandbox.stub(console, "error");
    const mockJsQuery = "javascript:onerror=alert%3Bthrow%20document.cookie";

    mockRedirectionQueryKey = word();
    mockRedirectionQueryValue = `${word()}:${mockJsQuery}`;
    const mockSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    const mockUrl = `${origin}${mockSearch}`;

    window.location.href = mockUrl;
    window.location.search = mockSearch;
    sandbox.stub(window, "URL").withArgs(`${window.location.origin}/${mockJsQuery}`).throws();

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;

    expect(assignStub.calledWith(`/`)).toBe(true);
    expect(errorStub.called).toBe(true);
  });

  it("should escape javascript", () => {
    // Arrange
    mockRedirectionQueryKey = word();
    mockRedirectionQueryValue = `javascript:alert('hey')`;
    const mockSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
    const mockUrl = `${origin}${mockSearch}`;

    window.location.href = mockUrl;
    window.location.search = mockSearch;

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;

    expect(assignStub.calledWith(`${origin}/alert('hey')`)).toBe(true);
  });

  describe("options.extraQueryParams", () => {
    it("should append options.extraQueryParams", () => {
      // Arrange
        const extraQueryParams = `?${word()}=${word()}&${word()}=${word()}`;

      // Act
        redirect(mockRedirectionQueryKey, { extraQueryParams });

      // Assert
      const assignStub = window.location.assign as SinonStub;
      expect(assignStub.calledWith(`${origin}${mockRedirectionQueryValue}${extraQueryParams}`)).toBe(true);
    });


    it("should append options.extraQueryParams when query string already exists", () => {
      // Arrange
      const extraQueryKey1 = word();
      const extraQueryValue1 = word();
      const extraQueryKey2 = word();
      const extraQueryValue2 = word();
      const extraQueryParams = `?${extraQueryKey1}=${extraQueryValue1}&${extraQueryKey2}=${extraQueryValue2}`;
      const queryKey1 = word();
      const queryValue1 = word();
      const queryKey2 = word();
      const queryValue2 = word();
      const query = `${queryKey1}=${queryValue1}&${queryKey2}=${queryValue2}`;
      const localSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}?${query}`;
      window.location.search = localSearch;
      window.location.href = `${url()}${localSearch}`;

      // Act
      redirect(mockRedirectionQueryKey, { extraQueryParams });

      // Assert
      const assignStub = window.location.assign as SinonStub;
      const searchParams = new URL(`${url()}${assignStub.getCall(0).args[0]}`).searchParams;

      expect(searchParams.get(queryKey1)).toBe(queryValue1);
      expect(searchParams.get(queryKey2)).toBe(queryValue2);
      expect(searchParams.get(extraQueryKey1)).toBe(extraQueryValue1);
      expect(searchParams.get(extraQueryKey2)).toBe(extraQueryValue2);
    });
  });

  describe("options.replace", () => {
    it("should call window.location.replace", () => {
      // Arrange

      // Act
      redirect(mockRedirectionQueryKey, { replace: true });

      // Assert
      const replaceStub = window.location.replace as SinonStub;
      const assignStub = window.location.assign as SinonStub;
      expect(replaceStub.calledWith(`${origin}${mockRedirectionQueryValue}`)).toBe(true);
      expect(assignStub.called).toBe(false);
    });
  });

  it("should redirect to /", () => {
    // Arrange
    sandbox.stub(window, "URL").throws();
    const errorStub = sandbox.stub(console, "error");

    // Act
    redirect(mockRedirectionQueryKey);

    // Assert
    const assignStub = window.location.assign as SinonStub;
    expect(assignStub.calledWith("/")).toBe(true);
    expect(errorStub.called).toBe(true);

  });

  describe("when options.eraseHash is true", () => {
    it("should redirect with erasing hash", () => {
      // Arrange
      const localHash = `#${word()}`;
      const localSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}${localHash}`;
      window.location.search = localSearch;
      window.location.href = `${url()}${localSearch}`;

      // Act
      redirect(mockRedirectionQueryKey, {eraseHash: true});

      // Assert
      const assignStub = window.location.assign as SinonStub;

      expect(new URL(`${url()}${assignStub.getCall(0).args[0]}`).hash).toBe("");
    });
  });

  it("should redirect with preserving %20", () => {
      // Arrange
      const key1 = word();
      const key2 = word();
      const key3 = word();
      window.location.href = `${origin}?${mockRedirectionQueryKey}=${key1}+${key2}+${key3}`;

      // Act
      redirect(mockRedirectionQueryKey);

      // Assert
      const assignStub = window.location.assign as SinonStub;

      expect(new URL(`${assignStub.getCall(0).args[0]}`).pathname).toBe(`/${key1}%20${key2}%20${key3}`);
    });

  describe("when options.decodePlus is true", () => {
    it("should redirect with encoding %20 to +", () => {
      // Arrange
      const key1 = word();
      const key2 = word();
      window.location.href = `${origin}?${mockRedirectionQueryKey}=${key1}+${key2}`;

      // Act
      redirect(mockRedirectionQueryKey, {decodePlus: true});

      // Assert
      const assignStub = window.location.assign as SinonStub;

      expect(new URL(`${assignStub.getCall(0).args[0]}`).pathname).toBe(`/${key1}+${key2}`);
    });
  });

  describe("when options.defaultPath is provided", () => {
    it("should redirect to defaultPath", () => {
      // Arrange
      const localSearch = `?${mockRedirectionQueryKey}=${mockRedirectionQueryValue}`;
      window.location.search = localSearch;
      const defaultPath = `/${word()}`;

      // Act
      redirect("", {defaultPath});

      // Assert
      const assignStub = window.location.assign as SinonStub;
      expect(new URL(`${assignStub.getCall(0).args[0]}`).pathname).toBe(defaultPath);
    });
  });
});