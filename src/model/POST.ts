export interface IPublicVariant {

    stability: PublicVariant;
    type: "Public";
}

export interface IEnclosedVariant {

    stability: EnclosedVariant;
    type: "Enclosed";

}

export enum PublicVariant {
    AnyZone = "AA",
    AnyAimsAdmin = "AAA",
    BackBurner = "BB",
    AnyHelpArea = "AHA",
    CollectedContent = "CC",
    DesignDoc = "DD",
    EnclosedEffort = "EE",
    FeedbackFlow = "FF",
    GrandGallery = "GG",
    HistoryHeap = "HH",
    InternalItem = "II",
    JammedJob = "JJ",
    KnownKiller = "KK",
    LabLog = "LL",
    MockupModel = "MM",
    NewNonefunctional = "NN",
    OperatesOften = "OO",
    PreProbing = "PP",
    QualityQuest = "QQ",
    ReviewedRelease = "RR",
    StableSource = "SS",
    TrustedTested = "TT",
    UploadUsed = "UU",
    VersionVariant = "VV",
    WorkingWheels = "WW",
    YesYet = "YY",
    XenoXero = "XX",
    ZenZone = "ZZ",
    ZenZoomAnchor = "ZZA",
}

export enum EnclosedVariant {
    InternalVariant = "IV",
    FeedbackVariant = "FV",
    OperatingVariant = "OV",
    MainVariant = "MV",
    AlphaVariant = "AV",
    BetaVariant = "BV",
    CandidateVariant = "CV",
    DeliverableVariant = "DV",
    HistoryVariant = "HV",
    LogVariant = "LV",
    KillerVariant = "KV",
    JammedVariant = "JV",
    GreatVariant = "GV",
    VersionedVariant = "VV",
    WorkingVariant = "WV",
    YetTestingVariant = "YV",
    XoutVariant = "XV",
}

export type Variant = IPublicVariant | IEnclosedVariant ;
