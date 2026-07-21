import { useMemo } from "react";
import { BingoActions } from "../../core/actions/bingoActions";
import { BingoPresenter } from "./bingoPresenter";
import type { IBingoViews } from "../../core/presentation/iBingoPresenter";
import { useDependency } from "@/hooks/useDependency";
import type { IBingoGateway } from "../gateways/HttpBingoGateway";

export const bingoPresenterProvider = (views: IBingoViews) => {
  const gateway = useDependency<IBingoGateway>("bingoGateway");
  return useMemo(() => BingoPresenter(BingoActions(gateway), views), [gateway, views]);
};
