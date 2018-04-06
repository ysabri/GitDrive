// The base of this code was taken from: https://github.com/desktop/desktop
// project, it was mainly written by: https://github.com/niik
// tslint:disable-next-line:no-var-requires
const protoCommitterID = require("../../../static/committerid_pb");
/**
 * A tuple of name, email, and date for the author or commit
 * info in a commit.
 */
export class CommitterID {
    /**
     * Parses a Git ident string (GIT_AUTHOR_IDENT or GIT_COMMITTER_IDENT)
     * into a commit identity. Returns null if string could not be parsed.
     */
    public static parseIdentity(identity: string): CommitterID | null {
      // See fmt_ident in ident.c:
      //  https://github.com/git/git/blob/3ef7618e6/ident.c#L346
      //
      // Format is "NAME <EMAIL> DATE"
      //  Markus Olsson <j.markus.olsson@gmail.com> 1475670580 +0200
      //
      // Note that `git var` will strip any < and > from the name and email, see:
      //  https://github.com/git/git/blob/3ef7618e6/ident.c#L396
      //
      // Note also that this expects a date formatted with the RAW option in git see:
      //  https://github.com/git/git/blob/35f6318d4/date.c#L191
      //
      const m = identity.match(/^(.*?) <(.*?)> (\d+) (\+|-)?(\d{2})(\d{2})/);
      if (!m) {
        return null;
      }

      const name = m[1];
      const email = m[2];
      // The date is specified as seconds from the epoch,
      // Date() expects milliseconds since the epoch.
      const date = new Date(parseInt(m[3], 10) * 1000);

      // The RAW option never uses alphanumeric timezone identifiers and in my
      // testing I've never found it to omit the leading + for a positive offset
      // but the docs for strprintf seems to suggest it might on some systems so
      // we're playing it safe.
      const tzSign = m[4] === "-" ? "-" : "+";
      const tzHH = m[5];
      const tzmm = m[6];

      const tzMinutes = parseInt(tzHH, 10) * 60 + parseInt(tzmm, 10);
      const tzOffset = tzMinutes * (tzSign === "-" ? -1 : 1);

      return new CommitterID(name, email, date, tzOffset);
    }

    /** Deserialize the byte array read from the proto message */
    public static deserialize(uint8Arr: Uint8Array): CommitterID {
      const mssg = protoCommitterID.CommitterID.deserializeBinary(uint8Arr);
      return new CommitterID(mssg);
    }

    public readonly committerIDProtoBuf: any;

    public constructor(
      protoMsg: any,
    )
    public constructor(
      name: string,
      email: string,
      date: Date,
      tzOffset?: number,
    )
    constructor(
      name: string | any,
      email?: string,
      date?: Date,
      tzOffset?: number,
    ) {
      if (typeof name === "string") {
        this.committerIDProtoBuf = new protoCommitterID.CommitterID();
        this.committerIDProtoBuf.setName(name);
        this.committerIDProtoBuf.setEmail(email);
        this.committerIDProtoBuf.setDate(date!.toDateString());
        this.committerIDProtoBuf.setTzoffset(tzOffset || new Date().getTimezoneOffset());
      } else {
        this.committerIDProtoBuf = name;
      }
    }

    public get name(): string {
      return this.committerIDProtoBuf.getName();
    }

    public get email(): string {
      return this.committerIDProtoBuf.getEmail();
    }

    public get date(): Date {
      return new Date(this.committerIDProtoBuf.getDate() as string);
    }

    public get tzOffset(): number {
      return this.committerIDProtoBuf.getTzoffset();
    }

    public toPrint(): string[] {
      return [this.name, this.email, this.date.toDateString(),
        String(this.tzOffset)];
    }

    public serialize(): Uint8Array {
      return this.committerIDProtoBuf.serializeBinary();
    }
  }
